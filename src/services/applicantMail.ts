import { promises as fsPromises } from 'fs';
import handlebars from 'handlebars';
import { ADMIN_MAIL, FRONTEND_ORIGIN } from '../secrets';
import { transporter } from '../utils/mailer';
import { sendSMS } from './applicantSMS';

export const applicantNotice = async (username:string, email:string, phoneNumber:string, staffId:string) => {
  try {
    // Read HTML template file
    const location = await fsPromises.readFile('src/templates/applicantEmail.html', 'utf-8');
    const template = handlebars.compile(location);

    // Define placeholders for the template
    const placeHolders = {
      username: username,
      staffId: staffId,
      email: email,
      phoneNumber: phoneNumber,
      frontURL: FRONTEND_ORIGIN
    };

    // Render HTML message
    const htmlMessage = template(placeHolders);

    // Send email
    await transporter.sendMail({
      from: ADMIN_MAIL,
      to: email,
      subject: "Welcome to Pakyi No. 2 Stool Lands",
      text: 'Hello',
      html: htmlMessage
    });

    // Extract SMS content from HTML message (if needed)
    const smsContent = htmlMessage.replace(/(<([^>]+)>)/gi, '');
    console.log(smsContent)

    // Send SMS
    await sendSMS(phoneNumber, smsContent);

    console.log("Email and SMS sent successfully");
  } catch (error) {
    console.error("Error sending email and SMS:", error);
  }
};
