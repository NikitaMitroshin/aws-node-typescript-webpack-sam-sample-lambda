provider "aws" {
  region = "ca-central-1"

  assume_role {
    role_arn     = "arn:aws:iam::${local.account_id[terraform.workspace]}:role/Terraform-CI"
    session_name = "ArticleProcessorFunction"
  }
}
