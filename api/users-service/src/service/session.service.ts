import { UserDocument } from "../models/user.model"

const CryptoJS = require('crypto-js')

function base64url(source: string) {
  // Encode in classical base64
  let encodedSource = CryptoJS.enc.Base64.stringify(source);

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}

export async function generateToken(user: UserDocument): Promise<string>
{
    let header = {
        "alg": "HS256",
        "typ": "JWT"
    }

    let stringifiedHeader: string = CryptoJS.enc.Utf8.parse(JSON.stringify(header))
    let encodedHeader: string = base64url(stringifiedHeader)

    let stringifiedData: string = CryptoJS.enc.Utf8.parse(JSON.stringify(user))
    let encodedData: string = base64url(stringifiedData);

    let token: string = encodedHeader + "." + encodedData;
    
    return token
}
