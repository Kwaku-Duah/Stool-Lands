import { promises as fsPromises } from 'fs';
import handlebars from 'handlebars';
import { ADMIN_MAIL, FRONTEND_ORIGIN } from '../secrets';
import { transporter } from '../utils/mailer';
import { sendSMS } from './applicantSMS';

export const applicantNotice = async (name:string, email:string, phoneNumber:string) => {
  try {
    const location = await fsPromises.readFile('src/templates/applicantEmail.html', 'utf-8');
    const template = handlebars.compile(location);

    const placeHolders = {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      frontURL: FRONTEND_ORIGIN
    };

    const htmlMessage = template(placeHolders);

    if (email) {
      await transporter.sendMail({
        from: ADMIN_MAIL,
        to: email,
        subject: "Welcome to Pakyi No. 2 Stool Lands",
        text: 'Hello',
        html: htmlMessage
      });
    } else {
      console.log("No email provided. Skipping email sending.");
    }

    const smsContent = htmlMessage.replace(/(<([^>]+)>)/gi, '');
    console.log(smsContent);

    // Send SMS
    await sendSMS(phoneNumber, smsContent);

    console.log("Email and SMS sent successfully");
  } catch (error) {
    console.error("Error sending email and SMS:", error);
  }
};