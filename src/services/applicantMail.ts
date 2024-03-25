import { promises as fsPromises } from 'fs';
import handlebars from 'handlebars';

import { ADMIN_MAIL, FRONTEND_ORIGIN } from '../secrets';
import { transporter } from '../utils/mailer';

export const applicantNotice = async ( username: string,email: string,phoneNumber:string,staffId:string) => {
    const location = await fsPromises.readFile('src/templates/applicantEmail.html', 'utf-8');
    const template = handlebars.compile(location);


    const placeHolders = {
      username:username,
      staffId:staffId,
      email: email,
      phoneNumber:phoneNumber,
      frontURL: FRONTEND_ORIGIN
    };

    const htmlMessage = template(placeHolders);

    return transporter.sendMail({
      from: ADMIN_MAIL,
      to: email,
      subject: "Welcome to Pakyi No. 2 Stool Lands",
      text: 'Hello',
      html: htmlMessage
    });
  };
