import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ArticlesApiService} from './services/articlesApiService';
import {ArticleProcessingService} from './services/articleProcessingService';
import {withExponentialBackoff} from './utils/backoff';

// Initialize services outside the handler to reduce cold start time
const articlesApiService = new ArticlesApiService(
    process.env.API_BASE_URL || 'https://api.example.com',
    process.env.API_TOKEN || 'default-token'
);
const articleProcessingService = new ArticleProcessingService();

/**
 * Lambda function handler
 * @param event - API Gateway event
 * @returns API Gateway response with 200 status code
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        // Parse the request body
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const articleId = requestBody.articleId;

        if (!articleId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Missing required parameter: articleId',
                })
            };
        }

        console.log(`Processing article with ID: ${articleId}`);

        // Get the draft revision with exponential backoff
        const draftRevision = await withExponentialBackoff(async () => {
            return await articlesApiService.getDraftRevision(articleId);
        });

        console.log('Draft revision retrieved successfully');

        // Process the article content
        const processedArticle = articleProcessingService.processArticle(draftRevision);
        console.log('Article content processed successfully');

        // Update the draft revision with exponential backoff
        await withExponentialBackoff(async () => {
            await articlesApiService.updateDraftRevision(articleId, processedArticle);
        });

        console.log('Draft revision updated successfully');

        // Publish the document with exponential backoff
        await withExponentialBackoff(async () => {
            await articlesApiService.publishDocument(articleId);
        });

        console.log('Document published successfully');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Article processed and published successfully',
                articleId: articleId,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Error processing article:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Error processing article',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}; 
