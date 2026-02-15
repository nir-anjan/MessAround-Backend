const { PrismaClient } = require("@prisma/client");

// Create a single instance of Prisma Client
// This should be reused throughout the application
const prisma = new PrismaClient({
  log: ["error"], // Only log errors, hide queries for cleaner logs
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
