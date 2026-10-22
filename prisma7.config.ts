import "dotenv/config";
import { defineConfig } from "prisma/config";
import config from "./src/app/config/env";
export default defineConfig({
  schema: "prisma/schema/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: config.database_url,
  },
});
