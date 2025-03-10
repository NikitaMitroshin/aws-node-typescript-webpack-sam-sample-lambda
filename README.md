# AWS Lambda Article Processor with Node.js 22, TypeScript, and Webpack

This project demonstrates an AWS Lambda function built with Node.js 22 and TypeScript, bundled using Webpack, and locally testable using AWS SAM. The Lambda function processes articles by replacing occurrences of "Google" with hyperlinks.

## Project Overview

This Lambda function:
- Receives API Gateway events with an article ID
- Retrieves the draft revision of the article from an external API
- Processes text elements by replacing "Google" with hyperlinks
- Updates the draft revision with the processed content
- Publishes the document
- Uses exponential backoff for API request retries

## Prerequisites

- Node.js 22.x or later
- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed
- TypeScript knowledge

## Project Structure

```
.
├── dist/                   # Compiled and bundled files (generated)
├── events/                 # Event files for testing
├── src/                    # Source code
│   ├── __mocks__/          # Mock data for testing
│   ├── __tests__/          # Test files
│   ├── services/           # Service modules
│   │   ├── articlesApiService.ts    # API service for article operations
│   │   └── articleProcessingService.ts # Service for processing article content
│   ├── utils/              # Utility functions
│   │   └── backoff.ts      # Exponential backoff implementation
│   └── index.ts            # Main Lambda handler
├── .gitignore              # Git ignore file
├── env.json                # Environment variables for local testing
├── jest.config.js          # Jest configuration
├── package.json            # NPM package configuration
├── run-local.sh            # Script to run the function locally
├── template.yaml           # AWS SAM template
├── tsconfig.json           # TypeScript configuration
└── webpack.config.js       # Webpack configuration
```

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Update the `env.json` file with your API credentials:
   ```json
   {
     "ArticleProcessorFunction": {
       "API_BASE_URL": "https://your-api-url.com",
       "API_TOKEN": "your-api-token"
     }
   }
   ```

## Development Workflow

### Build the Project

```
npm run build
```

This command uses Webpack to:
- Transpile TypeScript code
- Bundle the Lambda function
- Create a ZIP file ready for deployment

### Run Tests

```
npm test
```

For test coverage:

```
npm run test:coverage
```

### Run Locally

```
npm start
```

This script:
1. Builds the project with Webpack
2. Builds with AWS SAM
3. Invokes the function locally using the mock event

You can also run the commands manually:

```
npm run build
sam build
sam local invoke ArticleProcessorFunction -e ./src/__mocks__/event.json --debug --env-vars env.json
```

To test the API endpoint locally:

```
sam local start-api
```

Then send a POST request to http://localhost:3000/process-article with JSON body:
```json
{
  "articleId": "45bd40bcbd874ee8176ed90155839d3a"
}
```

## Deployment

To deploy the Lambda function to AWS:

```
npm run deploy
```

This command will:
1. Build the project with Webpack
2. Update the Lambda function code in AWS

Note: The deployment command assumes you have already created the Lambda function named `article-processor-lambda`. If you haven't, you need to create it first or use the AWS SAM deployment commands.

### SAM Deployment (Alternative)

You can also deploy using AWS SAM:

```
sam build
sam deploy --guided
```

## API Endpoints

When deployed, this function creates an API endpoint with:
- Method: POST
- Path: /process-article

The request body should include:
```json
{
  "articleId": "your-article-id"
}
```

The API returns a JSON response with:
- A success message
- The article ID
- Timestamp

## Configuration

The function is configured with:
- Runtime: Node.js 22.x
- Architecture: x86_64
- Memory: 256MB
- Timeout: 30 seconds

## License

ISC

## Author

[Mikita Mitroshyn](https://www.linkedin.com/in/mikita-mitroshyn/)

## Terraform Deployment (Sample)

The project includes sample Terraform scripts in the `terraform` directory that demonstrate how to deploy the Lambda function to AWS using Infrastructure as Code. These scripts are provided as examples and have not been tested in AWS, but they illustrate how such scripts could be used in a CI/CD pipeline.

### Terraform Structure

```
terraform/
├── lambda.tf          # Lambda function configuration
├── provider.tf        # AWS provider configuration
├── variable.tf        # Variables and environment-specific settings
└── .gitignore         # Git ignore file for Terraform
```

### Key Features

- **Environment-based deployment**: The scripts support different environments (Staging and Production) using Terraform workspaces
- **Environment-specific variables**: Different API tokens and endpoints for each environment
- **IAM role assumption**: The scripts assume a specific IAM role for deployment
- **Lambda configuration**: Includes memory, timeout, and environment variable settings

### Usage Example

To use these Terraform scripts (after proper testing and configuration):

1. Navigate to the terraform directory:
   ```
   cd terraform
   ```

2. Initialize Terraform:
   ```
   terraform init
   ```

3. Select the workspace (environment):
   ```
   terraform workspace select Staging  # or Prod
   ```

4. Plan the deployment:
   ```
   terraform plan -var="api_token_staging=your-staging-token" -var="api_token_prod=your-prod-token"
   ```

5. Apply the changes:
   ```
   terraform apply -var="api_token_staging=your-staging-token" -var="api_token_prod=your-prod-token"
   ```

**Note**: These scripts are provided as examples only and would need to be adapted to your specific AWS environment and requirements before use in a production setting.
