import fetch from 'node-fetch';
import { username, password, senderId } from '../secrets';

export const sendOTP = async function (phoneNumber: string): Promise<{ requestId: string; prefix: string; expirationTime: number } | null> {
    try {
        // Set OTP expiration time (10 minutes from now)
        const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes * 60 seconds * 1000 milliseconds

        const resp = await fetch(
            `https://api-devp-otp-2704.hubtel.com/otp/send`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
                },
                body: JSON.stringify({
                    senderId: senderId,
                    phoneNumber: phoneNumber,
                    countryCode: 'GH',
                    expirationTime: expirationTime
                })
            }
        );

        const data = await resp.json();
        console.log(data);

        if (data.code === '0000') {
            const requestId = data.data.requestId;
            const prefix = data.data.prefix;
            console.log(requestId, prefix);
            return { requestId, prefix, expirationTime };
        } else {
            console.error('Error sending OTP:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        return null;
    }
}

export async function verifyOTP(requestId: string, prefix: string, code: string): Promise<boolean> {
    try {
        const resp = await fetch(
            `https://api-devp-otp-2704.hubtel.com/otp/verify`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
                },
                body: JSON.stringify({
                    requestId: requestId,
                    prefix: prefix,
                    code: code
                })
            }
        );

        if (resp.status === 200) {
            console.log("OTP verified successfully.");
            return true;
        } else {
            console.error('OTP verification failed. Status:', resp.status);
            return false;
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
    }
};
