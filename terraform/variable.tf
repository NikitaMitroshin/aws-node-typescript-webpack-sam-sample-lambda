variable "api_token_staging" {}
variable "api_token_prod" {}

locals {
  # map Terraform workspace to AWS Account ID
  account_id = {
    Staging = "841807338058"
    Prod    = "271618980651"
  }
  # map Terraform workspace to short env name for S3 bucket
  env_map = {
    Staging = "stg"
    Prod    = "prd"
  }

  is_stg = terraform.workspace == "Staging"

  api_domain = local.is_stg ? "https://api.sandbox.example.com" : "https://api.example.com"

  api_token = local.is_stg ? var.api_token_staging : var.api_token_prod

}
