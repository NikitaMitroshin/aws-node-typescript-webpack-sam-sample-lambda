resource "aws_lambda_function" "aws-node-typescript-webpack-sam-sample-lambda" {
  function_name = "aws-node-typescript-webpack-sam-sample-lambda"
  description   = "Lambda function to update content elements of the article and re-publish it using Arc Draft API - ${terraform.workspace}"
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  publish       = false
  memory_size   = 128
  timeout       = 60
  architectures = ["x86_64"]
  role          = "arn:aws:iam::${local.account_id[terraform.workspace]}:role/SampleLambdaRole"

  filename         = "${path.root}/../dist/lambda-function.zip"
  source_code_hash = filebase64sha256("${path.root}/../dist/lambda-function.zip")


  environment {
    variables = {
      ARC_API_URL = "${local.api_domain}"
      ARC_TOKEN   = "${local.api_token}"
    }
  }

  ephemeral_storage {
    size = 512
  }
}
