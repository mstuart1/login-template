import express from 'express'
import * as dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import whitelist from '../../config/whitelist';
import path from 'path';
import {logger} from '../middleware/logEvents';
import errorHandler from '../middleware/errorHandler';
import verifyJWT from '../middleware/verifyJWT';

const app = express()

dotenv.config();
if (!process.env.CORS_ORIGIN) {
  console.warn('CORS_ORIGIN is not set. Allowing all origins.')
}


const corsOptions = {
  origin: (origin:any, callback:any) => {
    // todo production remove !origin and clean whitelist
    if (whitelist.includes(origin) || !origin) { // allow requests with no origin (like mobile apps or curl requests)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, // allow cookies to be sent with requests
}

// custom middleware to check if the user is authenticated
app.use(logger)

app.use(cors(corsOptions))
app.use(cookieParser()) // required for cookie handling in auth
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../public')))
app.use('/subdir', express.static(path.join(__dirname, '../../public'))) // in order to get css in public to work on the subdirectory
require("../metrics/metrics.router")(app);// metrics route for web vitals

require("../auth/auth.router")(app);
// everything below this point requires authentication
app.use(verifyJWT)
require("../user/user.router")(app);

// app.use('/*', require('../routes/maintenance')); // catch all routes and display maintenance page


app.get('/', (req, res) => {
    // res.send(`The server is working: ${new Date()}`)
})



// route handlers
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' })
})
app.get('/status', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' })
})  

// app.get('/hello(.html)?', (req, res, next) => {
//     console.log('attempted to load hello.html')
//     next()
// }, (req, res) => {
//     res.send('Hello World!')
// });

// const one = (req:any, res:any, next:any) => {
//   console.log('This is the first middleware')
//   next()
// }
// const two = (req:any, res:any, next:any) => {
//     console.log('This is the second middleware')
//     next()
// }
// const three = (req:any, res:any) => {
//     console.log('This is the third middleware')
//     res.send('This is the response from the third middleware')
// }
// app.get('/three-middleware', [one, two, three]);

app.all('*', (req, res) => {
  if (req.accepts('html')) {
    // if the request accepts HTML, send a 404 page
   res.status(404).sendFile(path.join(__dirname, '../../public/views', '404.html'))

  } else if (req.accepts('json')) {
    // if the request accepts JSON, send a 404 JSON response
    res.status(404).json({ error: 'Not Found' })
  } else {

    res.type('txt').status(404).send('Not Found') // if the request accepts neither HTML nor JSON, send a plain text response
  }
})

app.use(errorHandler);

export default app
