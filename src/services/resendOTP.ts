import fetch from 'node-fetch';
import { username,password } from '../secrets';

export async function resendOTP(requestId:string) {
    try {
        const resp = await fetch(
            `https://api-devp-otp-2704.hubtel.com/otp/resend`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
                },
                body: JSON.stringify({ requestId })
            }
        );

        const data = await resp.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error resending OTP:', error);
        throw error;
    }
}
