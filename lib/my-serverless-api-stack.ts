#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class MyServerlessApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const table = new dynamodb.Table(this, 'NotesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Remove in dev, not recommended for production
    });

    // Lambda function using DynamoDB
    const notesLambda = new lambda.Function(this, 'NotesHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const docClient = new AWS.DynamoDB.DocumentClient();
        const TABLE_NAME = process.env.TABLE_NAME;

        exports.handler = async function(event) {
          const { httpMethod, body, pathParameters } = event;
          const id = pathParameters ? pathParameters.id : undefined;

          try {
            switch (httpMethod) {
              case 'GET':
                if (id) {
                  const data = await docClient.get({ TableName: TABLE_NAME, Key: { id } }).promise();
                  return response(200, data.Item || {});
                } else {
                  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
                  return response(200, data.Items);
                }
              case 'POST':
                const newNote = JSON.parse(body);
                const noteId = Date.now().toString();
                const item = { id: noteId, ...newNote };
                await docClient.put({ TableName: TABLE_NAME, Item: item }).promise();
                return response(201, item);
              case 'PUT':
                if (!id) return response(400, { error: 'Missing note ID' });
                const updatedNote = JSON.parse(body);
                const updateItem = { id, ...updatedNote };
                await docClient.put({ TableName: TABLE_NAME, Item: updateItem }).promise();
                return response(200, updateItem);
              case 'DELETE':
                if (!id) return response(400, { error: 'Missing note ID' });
                await docClient.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
                return response(204);
              default:
                return response(405, { error: 'Method Not Allowed' });
            }
          } catch (err) {
            return response(500, { error: err.message });
          }
        };

        function response(statusCode, body = null) {
          return {
            statusCode,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : ''
          };
        }
      `),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant Lambda permission to access DynamoDB
    table.grantReadWriteData(notesLambda);

    // API Gateway setup
    const api = new apigateway.RestApi(this, 'NotesApi', {
      restApiName: 'Notes Service',
    });

    const notes = api.root.addResource('notes');
    const singleNote = notes.addResource('{id}');

    notes.addMethod('POST', new apigateway.LambdaIntegration(notesLambda));
    notes.addMethod('GET', new apigateway.LambdaIntegration(notesLambda));
    singleNote.addMethod('GET', new apigateway.LambdaIntegration(notesLambda));
    singleNote.addMethod('PUT', new apigateway.LambdaIntegration(notesLambda));
    singleNote.addMethod('DELETE', new apigateway.LambdaIntegration(notesLambda));
  }
}
