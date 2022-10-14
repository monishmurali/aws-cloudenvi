const AWS = require('aws-sdk');
const keys=require('./../config/keys');

//for dynamoDb
const awsDbConfig = {
    "region": keys.region,
    "endpoint": keys.AwsDynamoDbUrl,
    "accessKeyId": keys.AwsAccessKeyId, 
    "secretAccessKey": keys.AwsSecretAccessKey,
};
AWS.config.update(awsDbConfig);

const dynamoDbObj = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDbObj;

