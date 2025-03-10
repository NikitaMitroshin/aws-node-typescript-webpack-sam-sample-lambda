import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as articlesApiServiceModule from '../services/articlesApiService';
import * as articleProcessingServiceModule from '../services/articleProcessingService';
import { withExponentialBackoff } from '../utils/backoff';

// Mock the withExponentialBackoff utility
jest.mock('../utils/backoff');

// Mock console methods
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Import the handler after setting up the mocks
import { handler } from '../index';

describe('Lambda Handler Tests', () => {
  // Mock data
  const articleId = '45bd40bcbd874ee8176ed90155839d3a';
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    body: JSON.stringify({ articleId })
  };
  
  // Mock API responses
  const mockDraftRevision = {
    id: articleId,
    content_elements: [
      {
        _id: 'b34d5a88083fec1c1c0e2d6755c03e0e',
        content: 'Lorem Google ipsum dolor sit amet',
        type: 'text'
      },
      {
        _id: 'ff1b161e537cb12ba5bfe2ef3d69179d',
        type: 'reference'
      }
    ]
  };
  
  const mockProcessedArticle = {
    id: articleId,
    content_elements: [
      {
        _id: 'b34d5a88083fec1c1c0e2d6755c03e0e',
        content: 'Lorem <a href="https://www.google.com/" target="_blank">Google</a> ipsum dolor sit amet',
        type: 'text'
      },
      {
        _id: 'ff1b161e537cb12ba5bfe2ef3d69179d',
        type: 'reference'
      }
    ]
  };

  // Mock implementations
  const mockGetDraftRevision = jest.fn().mockResolvedValue(mockDraftRevision);
  const mockUpdateDraftRevision = jest.fn().mockResolvedValue(undefined);
  const mockPublishDocument = jest.fn().mockResolvedValue(undefined);
  const mockProcessArticle = jest.fn().mockReturnValue(mockProcessedArticle);
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the ArticlesApiService instance methods
    jest.spyOn(articlesApiServiceModule.ArticlesApiService.prototype, 'getDraftRevision')
      .mockImplementation(mockGetDraftRevision);
    jest.spyOn(articlesApiServiceModule.ArticlesApiService.prototype, 'updateDraftRevision')
      .mockImplementation(mockUpdateDraftRevision);
    jest.spyOn(articlesApiServiceModule.ArticlesApiService.prototype, 'publishDocument')
      .mockImplementation(mockPublishDocument);
    
    // Mock the ArticleProcessingService instance methods
    jest.spyOn(articleProcessingServiceModule.ArticleProcessingService.prototype, 'processArticle')
      .mockImplementation(mockProcessArticle);
    
    // Setup withExponentialBackoff mock to execute the function passed to it
    (withExponentialBackoff as jest.Mock).mockImplementation((fn) => fn());
  });

  it('should process an article successfully', async () => {
    // Execute the lambda
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    // Verify the result
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Article processed and published successfully');
    expect(JSON.parse(result.body)).toHaveProperty('articleId', articleId);
    
    // Verify service calls
    expect(mockGetDraftRevision).toHaveBeenCalledWith(articleId);
    expect(mockProcessArticle).toHaveBeenCalledWith(mockDraftRevision);
    expect(mockUpdateDraftRevision).toHaveBeenCalledWith(articleId, mockProcessedArticle);
    expect(mockPublishDocument).toHaveBeenCalledWith(articleId);
    
    // Verify withExponentialBackoff was used
    expect(withExponentialBackoff).toHaveBeenCalledTimes(3);
  });

  it('should return 400 when articleId is missing', async () => {
    // Create event without articleId
    const eventWithoutArticleId: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({})
    };
    
    // Execute the lambda
    const result = await handler(eventWithoutArticleId as APIGatewayProxyEvent);
    
    // Verify the result
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Missing required parameter: articleId');
    
    // Verify no service calls were made
    expect(mockGetDraftRevision).not.toHaveBeenCalled();
    expect(mockProcessArticle).not.toHaveBeenCalled();
    expect(mockUpdateDraftRevision).not.toHaveBeenCalled();
    expect(mockPublishDocument).not.toHaveBeenCalled();
  });

  it('should return 400 when body is missing', async () => {
    // Create event without body
    const eventWithoutBody: Partial<APIGatewayProxyEvent> = {};
    
    // Execute the lambda
    const result = await handler(eventWithoutBody as APIGatewayProxyEvent);
    
    // Verify the result
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Missing required parameter: articleId');
  });

  it('should return 500 when getDraftRevision fails', async () => {
    // Setup getDraftRevision to fail
    const error = new Error('API error');
    (withExponentialBackoff as jest.Mock).mockImplementationOnce(() => {
      throw error;
    });
    
    // Execute the lambda
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    // Verify the result
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Error processing article');
    expect(JSON.parse(result.body)).toHaveProperty('error', 'API error');
  });

  it('should return 500 when updateDraftRevision fails', async () => {
    // Setup updateDraftRevision to fail
    (withExponentialBackoff as jest.Mock)
      .mockImplementationOnce((fn) => fn()) // getDraftRevision succeeds
      .mockImplementationOnce(() => {       // updateDraftRevision fails
        throw new Error('Update failed');
      });
    
    // Execute the lambda
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    // Verify the result
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Error processing article');
    expect(JSON.parse(result.body)).toHaveProperty('error', 'Update failed');
    
    // Verify service calls
    expect(mockGetDraftRevision).toHaveBeenCalledWith(articleId);
    expect(mockProcessArticle).toHaveBeenCalledWith(mockDraftRevision);
    expect(mockPublishDocument).not.toHaveBeenCalled();
  });

  it('should return 500 when publishDocument fails', async () => {
    // Setup publishDocument to fail
    (withExponentialBackoff as jest.Mock)
      .mockImplementationOnce((fn) => fn()) // getDraftRevision succeeds
      .mockImplementationOnce((fn) => fn()) // updateDraftRevision succeeds
      .mockImplementationOnce(() => {       // publishDocument fails
        throw new Error('Publish failed');
      });
    
    // Execute the lambda
    const result = await handler(mockEvent as APIGatewayProxyEvent);
    
    // Verify the result
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Error processing article');
    expect(JSON.parse(result.body)).toHaveProperty('error', 'Publish failed');
    
    // Verify service calls
    expect(mockGetDraftRevision).toHaveBeenCalledWith(articleId);
    expect(mockProcessArticle).toHaveBeenCalledWith(mockDraftRevision);
    expect(mockUpdateDraftRevision).toHaveBeenCalledWith(articleId, mockProcessedArticle);
  });
}); 