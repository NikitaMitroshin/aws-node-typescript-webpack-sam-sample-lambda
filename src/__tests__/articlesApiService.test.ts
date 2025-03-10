import axios from 'axios';
import { ArticlesApiService } from '../services/articlesApiService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ArticlesApiService', () => {
  const baseUrl = 'https://api.example.com';
  const token = 'test-token';
  const articleId = 'test-article-id';
  let articlesApiService: ArticlesApiService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Create a mock of the axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn()
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    
    // Initialize the service with our test values
    articlesApiService = new ArticlesApiService(baseUrl, token);
    
    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: `${baseUrl}/v1/article`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    });
  });

  describe('getDraftRevision', () => {
    it('should return data when the API call is successful', async () => {
      const mockResponse = {
        status: 200,
        data: { 
          id: articleId, 
          content_elements: [
            { _id: '1', type: 'text', content: 'Test content' }
          ]
        }
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await articlesApiService.getDraftRevision(articleId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/${articleId}/revision/draft`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when the API call fails', async () => {
      const mockError = new Error('API error');
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(articlesApiService.getDraftRevision(articleId))
        .rejects
        .toThrow('API error');
    });

    it('should throw an error when the response status is not 200', async () => {
      const mockResponse = {
        status: 404,
        data: { error: 'Not found' }
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      await expect(articlesApiService.getDraftRevision(articleId))
        .rejects
        .toThrow('Failed to get draft revision. Status code: 404');
    });
  });

  describe('updateDraftRevision', () => {
    const draftRevision = { 
      id: articleId,
      content_elements: [
        { _id: '1', type: 'text', content: 'Updated content' }
      ]
    };

    it('should complete successfully when the API call succeeds', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true }
      };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      await articlesApiService.updateDraftRevision(articleId, draftRevision);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/${articleId}/revision/draft`,
        {
          document_id: articleId,
          draftRevision: draftRevision
        }
      );
    });

    it('should throw an error when the API call fails', async () => {
      const mockError = new Error('Update API error');
      mockAxiosInstance.put.mockRejectedValue(mockError);

      await expect(articlesApiService.updateDraftRevision(articleId, draftRevision))
        .rejects
        .toThrow('Update API error');
    });

    it('should throw an error when the response status is not 200', async () => {
      const mockResponse = {
        status: 400,
        data: { error: 'Bad request' }
      };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      await expect(articlesApiService.updateDraftRevision(articleId, draftRevision))
        .rejects
        .toThrow('Failed to update draft revision. Status code: 400');
    });
  });

  describe('publishDocument', () => {
    it('should complete successfully when the API call succeeds', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true }
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await articlesApiService.publishDocument(articleId);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `/${articleId}/revision/published`,
        {
          type: "story",
          id: articleId
        }
      );
    });

    it('should throw an error when the API call fails', async () => {
      const mockError = new Error('Publish API error');
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(articlesApiService.publishDocument(articleId))
        .rejects
        .toThrow('Publish API error');
    });

    it('should throw an error when the response status is not 200', async () => {
      const mockResponse = {
        status: 500,
        data: { error: 'Server error' }
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      await expect(articlesApiService.publishDocument(articleId))
        .rejects
        .toThrow('Failed to publish document. Status code: 500');
    });
  });
}); 