# AWS Lambda with Node.js 22, TypeScript, and Webpack

This project demonstrates a sample AWS Lambda function built with Node.js 22 and TypeScript, bundled using Webpack, and locally testable using AWS SAM.

## Project Overview

This is a simple AWS Lambda function that:
- Receives API Gateway events
- Processes requests using a helper service
- Returns structured JSON responses
- Has proper error handling

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
│   ├── helpers/            # Helper modules
│   └── index.ts            # Main Lambda handler
├── .gitignore              # Git ignore file
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
sam local invoke SampleFunction -e ./src/__mocks__/event.json --debug
```

## Deployment

To deploy the Lambda function to AWS:

```
npm run deploy
```

This command will:
1. Build the project with Webpack
2. Update the Lambda function code in AWS

Note: The deployment command assumes you have already created the Lambda function named `sample-lambda`. If you haven't, you need to create it first or use the AWS SAM deployment commands.

### SAM Deployment (Alternative)

You can also deploy using AWS SAM:

```
sam build
sam deploy --guided
```

## API Endpoints

When deployed, this function creates an API endpoint with:
- Method: GET
- Path: /

The API returns a JSON response with:
- A success message
- Processing result
- Timestamp

## Configuration

The function is configured with:
- Runtime: Node.js 22.x
- Architecture: x86_64
- Memory: 128MB
- Timeout: 10 seconds

## License

ISC

## Author

[Mikita Mitroshyn](https://www.linkedin.com/in/mikita-mitroshyn/)
