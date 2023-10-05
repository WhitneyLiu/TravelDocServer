
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
            file_id: 'user-registration',
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
        const token = event.headers.authorization;
        const parts = token.split('.');
        const encodedPayload = parts[1];
        const decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
        const jsonPayload = JSON.parse(decodedPayload);
        const userId = jsonPayload.username;
        const input = {
            ExpressionAttributeNames: {
            "#attr": attribute,
            },
            ExpressionAttributeValues: {
            ":at": json[attribute]
            },
            Key: {
            user_id: userId,
            file_id: 'user-profile'
            },
            ReturnValues: "ALL_NEW",
            TableName: "TravelDoc",
            UpdateExpression: "SET #attr = :at"
        };
        const command = new UpdateCommand(input);
        // const command = new PutCommand({
        //   TableName:'TravelDoc',
        //   Item: {
        //     user_id:userId,
        //     file_id: 'user-profile',
        //     [attribute]: json[attribute],
        //     // first_name: json.firstName,
        //     // last_name: json.lastName,
        //     // occupation: json.occupation,
        //     // phone_number: json.phoneNumber,
        //     // emergency_contact: json.emergencyContact,
        //     // user_email: json.email,
        //     // country:  json.country,
        //     // street_address: json.streetAddress,
        //     // city:  json.city,
        //     // province:  json.state,
        //     // zip: json.zip,
        //     // birthday: json.birthday
        //   }
        // });
        const updateResult = await client.send(command);
        response.body = JSON.stringify({
            message: "successfully updated user profile.",
            updateResult,
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
    console.log(event);
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