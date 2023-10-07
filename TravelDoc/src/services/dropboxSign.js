import * as DropboxSign from "@dropbox/sign";
const path = require("path");
const fs = require('fs');

const signatureRequestApi = new DropboxSign.SignatureRequestApi();

signatureRequestApi.username = process.env.DROPBOX_API_KEY;

const generateEmbeddedSignUrl = async(event) => {
    const body = JSON.parse(event.body);
    const response = {statusCode: 200};
    try{
        const signer = {
            emailAddress: "jack@example.com",
            name: "Jack",
            order: 0,
        };
          
        const signingOptions = {
            draw: true,
            type: true,
            upload: true,
            phone: true,
            defaultType: "draw",
        };
          
        const data = {
            clientId: ProcessCredentials.env.CLIENT_ID,
            title: "TravelDoc Sign",
            subject: "",
            message: "Please sign this document to try out the App",
            signers: [ signer ],
            ccEmailAddresses: ["lawyer1@dropboxsign.com"],
            file_urls: ["https://www.dropbox.com/s/ad9qnhbrjjn64tu/mutual-NDA-example.pdf?dl=1"],
            signingOptions,
            testMode: true,
        };
        const result = await signatureRequestApi.signatureRequestCreateEmbedded(data);

        response.body = JSON.stringify({
            message: "successfully crete request.",
            result,
        });
    }catch(err){
        console.error(err);
        response.statusCode = 500;
        response.body =JSON.stringify({
            message: "failed to create request.",
            errorMsg: err.message,
            errorStack: err.stack,
        })
    }
    return response;   
}

module.exports = {
  generateEmbeddedSignUrl,
};