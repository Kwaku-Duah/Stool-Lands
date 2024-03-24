import { hashSync } from 'bcrypt';
import { ROLE } from '@prisma/client';
import db from '../src/dbConfig/db';

const logMessage = (message: string) => {
  process.stdout.write(`${message}\n`);
};

const email = 'duah229@gmail.com';
const phoneNumber = '233-542370701';

export async function seedScript() {
  // Check if the user with the given email already exists
  const existingUserByEmail = await db.user.findFirst({
    where: {
      email: email
    }
  });

  if (existingUserByEmail) {
    // If the user exists, delete it
    await db.user.delete({
      where: {
        email: email
      }
    });

    logMessage('Existing user with email deleted.');
  }

  // Check if the user with the given phoneNumber already exists
  const existingUserByPhoneNumber = await db.user.findFirst({
    where: {
      phoneNumber: phoneNumber
    }
  });

  if (existingUserByPhoneNumber) {
    // If the user exists, delete it
    await db.user.delete({
      where: {
        phoneNumber: phoneNumber
      }
    });

    logMessage('Existing user with phoneNumber deleted.');
  }

  // Create the user with the specified details
  const hashedPassword = hashSync('$nanaKwakuDollars', 10);

  await db.user.create({
    data: {
      username:"Nana Kwaku Duah",
      email: email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      role: ROLE.ADMIN,
      changePassword:false
    }
  });

  logMessage('User created successfully.');
}

seedScript();
