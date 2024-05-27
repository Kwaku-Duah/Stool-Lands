import { hashSync } from 'bcrypt';
import { ROLE } from '@prisma/client';
import db from '../src/dbConfig/db';

const logMessage = (message: string) => {
  process.stdout.write(`${message}\n`);
};

const email = 'duah229@gmail.com';
const phoneNumber = '233542370701';

export async function seedScript() {
  const existingUserByEmail = await db.user.findFirst({
    where: {
      email: email
    }
  });

  if (existingUserByEmail) {
    await db.user.delete({
      where: {
        email: email
      }
    });

    logMessage('Existing user with email deleted.');
  }

  

  const existingUserByPhoneNumber = await db.user.findFirst({
    where: {
      phoneNumber: phoneNumber
    }
  });

  if (existingUserByPhoneNumber) {

    await db.user.delete({
      where: {
        phoneNumber: phoneNumber
      }
    });

    logMessage('Existing user with phoneNumber deleted.');
  }

  const hashedPassword = hashSync('$nanaKwakuDollars', 10);

  await db.user.create({
    data: {
      name:"Nana Kwaku Duah",
      email: email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      occupation: "ADMINISTRATOR",
      changePassword:false,
      role: ROLE.ADMIN,
    }
  });

  logMessage('User created successfully.');
}

seedScript();
