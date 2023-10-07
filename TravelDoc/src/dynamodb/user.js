
const { DynamoDBClient } = require ("@aws-sdk/client-dynamodb"); 
const { DynamoDBDocumentClient, DeleteCommand, PutCommand, QueryCommand, UpdateCommand} = require ("@aws-sdk/lib-dynamodb");

const client0 = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(client0);

//Put user record into DynamoDB after user confirmation in Cognito
const createUser = async (event) => {
    const response = {statusCode: 200};
    try{
        const userAttributes = event.request.userAttributes;
        const time = new Date().toISOString();
        const command = new PutCommand({
            TableName:'TravelDoc',
            Item: {
            user_id: userAttributes.sub,
            file_id: 'user-profile',
            user_email: userAttributes.email,
            createdAt: time,
            }
        });
        const createResult = await client.send(command);
        response.body = JSON.stringify({
            message: "successfully created user.",
            createResult,
        });
    }catch (err){
        console.error(err);
        response.statusCode = 500;
        response.body =JSON.stringify({
            message: "failed to create user.",
            errorMsg: err.message,
            errorStack: err.stack,
        })
    }
    return response;
};

const updateUserProfile = async (event) => {
    const response = {statusCode: 200};
    try{
        const body = JSON.parse(event.body);
        const attributeName = Object.keys(body)[0];
        const attributeValue = Object.values(body)[0];
        const token = event.headers.authorization;
        const parts = token.split('.');
        const encodedPayload = parts[1];
        const decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
        const jsonPayload = JSON.parse(decodedPayload);
        const userId = jsonPayload.username;
        let exp = {
            UpdateExpression: 'SET',
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {}
        };
        exp.UpdateExpression += ` #${attributeName} = :${attributeName}`;
        exp.ExpressionAttributeNames[`#${attributeName}`] = attributeName;
        exp.ExpressionAttributeValues[`:${attributeName}`] = attributeValue;
        const input = {
            Key: {
                user_id: userId,
                file_id: 'user-profile'
            },
            ReturnValues: "UPDATED_NEW",
            TableName: "TravelDoc",
            ...exp
        };
        const command = new UpdateCommand(input);
        const updateResult = await client.send(command);
        response.body = JSON.stringify({
            message: "successfully updated user profile.",
            updateResult,
            input
        });
    }catch (err) {
        console.error(err);
        response.statusCode = 500;
        response.body =JSON.stringify({
            message: "failed to update user profile.",
            errorMsg: err.message,
            errorStack: err.stack,  
        })
    };
    return response;
};
const getUserProfile = async (event) => {
    const response = {statusCode: 200};
    try{
        const token = event.headers.authorization;
        const parts = token.split('.');
        const encodedPayload = parts[1];
        const decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
        const jsonPayload = JSON.parse(decodedPayload);
        const userId = jsonPayload.username;
        const command = new QueryCommand({
            TableName: "TravelDoc",
            KeyConditionExpression: "user_id = :uid and file_id = :fid",
            ExpressionAttributeValues: {
              ":uid": userId,
              ":fid": 'user-profile',
            },
            ProjectionExpression: "firstName,lastName,occupation,phoneNumber,emergencyContact,user_email,country,streetAddress,city,province,zip,birthday",
        });
        const getResult = await client.send(command);
        response.body = JSON.stringify({
            message: "Successfully retrieved user profile.",
            data: getResult,
        });
    }catch (err) {
        console.error(err);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve profile.",
            errorMsg: err.message,
            errorStack: err.stack,
        });
    }
    return response;
};
module.exports ={
createUser,
updateUserProfile,
getUserProfile,

};