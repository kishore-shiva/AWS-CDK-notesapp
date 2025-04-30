# Deploying a Serverless API with AWS CDK - Beginner-Friendly Guide


This guide is for software developers who are new to AWS. It walks through creating an AWS account, installing and configuring the AWS CLI, setting up AWS CDK, and deploying a simple serverless API backed by DynamoDB.

1. Create an AWS Account
------------------------
1. Visit https://aws.amazon.com/
2. Click Create an AWS Account
3. Enter your email, password, and account name
4. Add payment information (a free tier is available)
5. Choose Root user during setup
6. After account setup, sign in at https://console.aws.amazon.com/

2. Set Up AWS CLI
-----------------
Step 1: Install AWS CLI
- Download from: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

Step 2: Verify Installation
    aws --version

Step 3: Configure AWS CLI
    aws configure

3. Get AWS Access Keys
----------------------
1. Login to AWS Console
2. Go to your profile > Security Credentials
3. Create access key
4. Use in aws configure

4. Install AWS CDK
------------------
Prerequisites: Node.js (v14+)
    npm install -g aws-cdk
    cdk --version

5. Bootstrap Your CDK Project
-----------------------------
    mkdir serverless-api-cdk && cd serverless-api-cdk
    cdk init app --language typescript
    npm install aws-cdk-lib constructs

6. Add Your Stack Code
----------------------
Replace content in lib/serverless-api-cdk-stack.ts with the provided code.
Ensure bin/serverless-api-cdk.ts imports and initializes the stack.

7. Bootstrap and Deploy
-----------------------
    cdk bootstrap
    cdk deploy

8. Testing the API
------------------
Use Postman or curl:
    curl -X POST https://<api-url>/notes -H "Content-Type: application/json" -d '{"title":"Test","content":"Hello world"}'
    curl https://<api-url>/notes

9. Cleanup (Optional)
---------------------
    cdk destroy

10. Helpful Commands Summary
----------------------------
| Command           | Description                          |
|------------------|--------------------------------------|
| cdk init         | Initialize new CDK project           |
| cdk bootstrap    | Prepare AWS environment              |
| cdk deploy       | Deploy CDK stack                     |
| cdk destroy      | Remove CDK stack                     |
| aws configure    | Setup AWS CLI credentials            |

11. Tips
--------
- Use secrets manager in real apps
- Never hardcode credentials
- Monitor costs if using beyond free tier
