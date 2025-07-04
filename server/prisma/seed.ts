import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//**
//  * in package json: "prisma": {
// * "seed": "ts-node-dev prisma/seed.ts"
// *},
//  * npx prisma db seed
//  */

async function main() {
  // Delete all previously existing data for users who have unique email constraint
  
  await prisma.token.deleteMany({});
  await prisma.user.deleteMany({});
   

  await prisma.user.createMany({
    data: [
      // ADMIN
      {
      
      firstName: "test",
      lastName: "admin",
      email: "testadmin@test.io",
      active: true,
      role: 'ADMIN',
      },
      // USER
      {
      firstName: "test",
      lastName: "user",
      email: "testuser@test.io",
      active: true,
      role: 'USER',
      },
      ],
  });  

}

main().then(() => {
  console.log("Data seeded...");
});