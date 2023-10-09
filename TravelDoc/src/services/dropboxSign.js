const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const axios = require('axios');
const endpointCreateRequest = "https://" + process.env.DROPBOX_API_KEY + ":@api.hellosign.com/v3/signature_request/create_embedded";

const generateEmbeddedSignUrl = async(event) => {
    const signerData = JSON.parse(event.body);
    const response = {statusCode: 200};
    try{
        const signer = {
            email_address: signerData.email,
            name: signerData.name,
            order: 0,
        };
          
        const signing_options = {
            draw: true,
            type: true,
            upload: true,
            phone: false,
            defaultType: "draw",
        };
          
        const data = {
            client_id: process.env.CLIENT_ID,
            title: "TravelDoc Sign",
            subject: "",
            message: "Please sign this document to try out the App",
            signers: [ signer ],
            cc_email_addresses: ["lawyer1@dropboxsign.com"],
            file_urls: ["https://www.dropbox.com/s/ad9qnhbrjjn64tu/mutual-NDA-example.pdf?dl=1"],
            signing_options,
            test_mode: true,
        };
        const createRequestRes = await axios.post(endpointCreateRequest,JSON.stringify(data));
        const temp = JSON.stringify(createRequestRes);
        const obj = JSON.parse(temp);
        const signatureId = obj.signature_request.signatures[0].signature_id;
        const endpointSignUrl = "https://" + process.env.DROPBOX_API_KEY + ":@api.hellosign.com/v3/embedded/sign_url/" + signatureId;
        const result = axios.get(endpointSignUrl);
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
            endpointCreateRequest
        })
    }
    return response;   
}

export default {
  generateEmbeddedSignUrl,
};