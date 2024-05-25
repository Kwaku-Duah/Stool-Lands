import { promises as fsPromises } from 'fs';
import handlebar from 'handlebars';
import { ADMIN_MAIL } from '../secrets';
import { transporter } from '../utils/mailer';

export const sendPasswordResetEmail = async (name: string,email: string, link: string) => {
  const location = await fsPromises.readFile('src/templates/forgotEmail.html', 'utf-8');
  const template = handlebar.compile(location);

  const placeHolders = {
    name:name,
    email:email,
    frontURL: link
  };
  const htmlMessage = template(placeHolders);
  return transporter.sendMail({
    from: ADMIN_MAIL,
    to: email,
    subject: 'Forgotten your password, reset it...',
    text: 'Hello Reset...',
    html: htmlMessage
  });
};