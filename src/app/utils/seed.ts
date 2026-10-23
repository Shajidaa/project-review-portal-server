import { prisma } from "../libs/prisma";
import config from "../config/env";
import bcrypt from "bcrypt";
import { Role } from "../../../generated/prisma/enums";
export const seedAdmin = async () => {
  try {
    const isAdminExist = await prisma.user.findUnique({
      where: {
        email: config.tester_admin_email,
      },
    });
    if (isAdminExist) {
      console.log("Tester Admin Already Exists!");
      return;
    }

    const name = config.tester_admin_name;
    const email = config.tester_admin_email;
    const password = config.tester_admin_password;

    if (!name || !email || !password) {
      throw new Error(
        "Tester admin Name , Email, Password Missing In Env File!!!",
      );
    }

    const hashedPassword = await bcrypt.hash(password, config.salt_rounds);

    const testerMentor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        gender: "MALE",
        emailVerified: true,
      },
    });

    console.log("Tester admin created : ", testerMentor);
  } catch (error) {
    console.log("Error Seeding Tester Admin : ", error);
  }
};
export const seedMentor = async () => {
  try {
    const isMentorExist = await prisma.user.findUnique({
      where: {
        email: config.tester_mentor_email,
      },
    });
    if (isMentorExist) {
      console.log("Tester MENTOR Already Exists!");
      return;
    }

    const name = config.tester_mentor_name;
    const email = config.tester_mentor_email;
    const password = config.tester_mentor_password;

    if (!name || !email || !password) {
      throw new Error(
        "Tester MENTOR Name , Email, Password Missing In Env File!!!",
      );
    }

    const hashedPassword = await bcrypt.hash(password, config.salt_rounds);

    const testerMentor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.MENTOR,

        emailVerified: true,
      },
    });

    console.log("Tester Mentor Created : ", testerMentor);
  } catch (error) {
    console.log("Error Seeding Tester Mentor : ", error);
  }
};
