#!/bin/bash


if [[ -z "$1" ]]; then
  echo "Please provide an environment: dev, test, or uat"
  exit 1
fi

if [[ ! "$1" =~ ^(dev|test|uat)$ ]]; then
  echo "Invalid environment. Please provide dev, test, or uat"
  exit 1
fi

if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" || -z "$AWS_REGION" ]]; then
  echo "Missing required environment variables."
  echo "Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION."
  exit 1
fi


export ENV="$1"


DIR_NAME=$(basename "$PWD")

ZIP_FILE="$DIR_NAME.zip"


zip -r "$ZIP_FILE" *

if [ $? -eq 0 ]; then
  echo "Files successfully zipped into $ZIP_FILE"

  aws lambda update-function-code \
      --function-name pingPong \
      --zip-file fileb://$ZIP_FILE 2>&1 | tee /dev/stderr

  aws s3 cp $ZIP_FILE s3://your-bucket-name/$ENV/$ZIP_FILE 2>&1 | tee /dev/stderr

  echo "Files uploaded to Lambda and S3 bucket"
else
  echo "Failed to create zip file"
fi