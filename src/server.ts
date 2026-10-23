import app from "./app";
import { prisma } from "./app/libs/prisma";
import { seedAdmin, seedMentor } from "./app/utils/seed";

const main = async () => {
  try {
    const PORT = 5000;
    app.listen(PORT, async () => {
      await prisma.$connect();
      console.log("Connected to the database successfully.");
      await seedMentor();
      await seedAdmin();
      console.log(` Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Error starting the server:", error);
    // process.exit(1);
  }
};

main();
