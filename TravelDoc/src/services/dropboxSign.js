const DropboxSign = require('@dropbox/sign');
const fs = require("fs");
const path = require("path");
const signatureRequestApi = new DropboxSign.SignatureRequestApi();
signatureRequestApi.username = "75f12ce35d222353893acdca6e673441da448f3eae646032c212e9a7f57b99cd";
const embeddedApi = new DropboxSign.EmbeddedApi();
embeddedApi.username = "75f12ce35d222353893acdca6e673441da448f3eae646032c212e9a7f57b99cd";
const generateEmbeddedSignUrl = async(event) => {
    const signerData = JSON.parse(event.body);
    const response = {statusCode: 200};
    try{
        const signer = {
            emailAddress: signerData.email,
            name: signerData.name,
            order: 0,
        };
          
          
        const signingOptions = {
            draw: true,
            type: true,
            upload: true,
            phone: false,
            defaultType: "draw",
        };
        const data = {
            clientId: "963b73b69f7f935260e11119fc3329c9",
            title: "TravelDoc Sign",
            subject: "",
            message: "Please sign this document to try out the App",
            signers: [ signer],
            ccEmailAddresses: [
              "lawyer1@dropboxsign.com"
            ],
            files: [fs.createReadStream(path.join(__dirname, "FlightBookingContract-20231003-142718.pdf"))],
            signingOptions,
            testMode: true,
        };  
        
        const createEmbeddedResult = await signatureRequestApi.signatureRequestCreateEmbedded(data);
        const signatureId = createEmbeddedResult.body.signatureRequest.signatures[0].signatureId;
        const result = await embeddedApi.embeddedSignUrl(signatureId);
        const signUrl = result.body.embedded.signUrl;
        
        response.body = JSON.stringify({
            message: "successfully crete request.",
            signUrl
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