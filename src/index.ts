import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HelperService } from './helpers/helper';

// Initialize the helper service outside the handler to reduce cold start time
// This code runs once during the Lambda initialization
const helperService = new HelperService('LambdaHelper', 3000);

/**
 * Lambda function handler
 * @param event - API Gateway event
 * @returns API Gateway response with 200 status code
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Use the helper service that was initialized outside the handler
    const result = helperService.processRequest();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Lambda function executed successfully',
        result: result,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error processing request',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 
