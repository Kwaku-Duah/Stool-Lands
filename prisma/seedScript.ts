import { hashSync } from 'bcrypt';
import { ROLE } from '@prisma/client';
import db from '../src/dbConfig/db';

const logMessage = (message: string) => {
  process.stdout.write(`${message}\n`);
};

const email = 'duah229@gmail.co';
const phoneNumber = '233542370708';

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
      occupation: "CHIEF",
      changePassword:false,
      activeStatus:true,
      role: ROLE.ADMIN,
    }
  });

  logMessage('User created successfully.');
}

seedScript();
