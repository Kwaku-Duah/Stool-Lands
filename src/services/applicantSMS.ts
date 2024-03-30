import fetch from 'node-fetch';
import { username, password, senderId } from '../secrets';

export async function sendSMS(phoneNumber: string,message:string) {
  try {
    // Construct the URL with dynamic parameters using template literals
    const url = `https://smsc.hubtel.com/v1/messages/send?clientsecret=${password}&clientid=${username}&from=${senderId}&to=${phoneNumber}&content=${encodeURIComponent(message)}`;

    const resp = await fetch(url);

    const data = await resp.json();
    console.log(data);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}
