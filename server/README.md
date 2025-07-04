.env file should include data for variables: DATABASE_URL, API_PORT,CORS_ORIGIN,  JWT_SECRET

clone the git

if you need to tunnel ssh -L 5432:localhost:5432 mstuart@mosaic.njaes.rutgers.edu FROM TERMINAL NOT VSCODE TERMINAL

if you need to update the database with structural changes, 
`npx prisma migrate dev --name <describe purpose>`

`npx prisma studio` allows view and full control of db


