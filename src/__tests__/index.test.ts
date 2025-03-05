import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {handler} from '../index';
import * as mockEvent from '../__mocks__/event.json';

// Mock console methods to avoid cluttering test output
jest.spyOn(console, 'log').mockImplementation(() => {
});
jest.spyOn(console, 'error').mockImplementation(() => {
});

describe('Lambda Handler', () => {
    let event: APIGatewayProxyEvent;
    let context: Context;

    beforeEach(() => {
        // Create a fresh copy of the event for each test
        event = JSON.parse(JSON.stringify(mockEvent)) as APIGatewayProxyEvent;

        // Mock Lambda context
        context = {
            callbackWaitsForEmptyEventLoop: true,
            functionName: 'test-function',
            functionVersion: '1',
            invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
            memoryLimitInMB: '128',
            awsRequestId: '1234567890',
            logGroupName: '/aws/lambda/test-function',
            logStreamName: '2021/01/01/[$LATEST]1234567890',
            getRemainingTimeInMillis: () => 1000,
            done: () => {
            },
            fail: () => {
            },
            succeed: () => {
            },
        };
    });

    test('should return 200 response with success message', async () => {
        // Act
        const response = await handler(event) as APIGatewayProxyResult;
        const body = JSON.parse(response.body);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.headers).toHaveProperty('Content-Type', 'application/json');
        expect(body).toHaveProperty('message', 'Lambda function executed successfully');
        expect(body.result).toHaveProperty('success', true);
        expect(body.result.message).toContain('Request processed successfully');
        expect(body).toHaveProperty('timestamp');
    });

    test('should handle errors gracefully', async () => {
        // Arrange
        // Mock HelperService to throw an error for this test
        const originalProcessRequest = require('../helpers/helper').HelperService.prototype.processRequest;
        require('../helpers/helper').HelperService.prototype.processRequest = jest.fn().mockImplementation(() => {
            throw new Error('Test error');
        });

        try {
            // Act
            const response = await handler(event) as APIGatewayProxyResult;
            const body = JSON.parse(response.body);

            // Assert
            expect(response.statusCode).toBe(500);
            expect(response.headers).toHaveProperty('Content-Type', 'application/json');
            expect(body).toHaveProperty('message', 'Error processing request');
            expect(body).toHaveProperty('error', 'Test error');
        } finally {
            // Restore the original method
            require('../helpers/helper').HelperService.prototype.processRequest = originalProcessRequest;
        }
    });
}); 
