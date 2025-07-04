import app from './lib/createServer'
import logEvents from './middleware/logEvents'
// import EventEmitter = require('events');

let port = process.env.API_PORT || 3500;


app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`)
    logEvents(`Server started on port ${port}`, 'server.log')
}).on('error', (err) => {
    console.error(`Error starting server: ${err.message}`);
    logEvents(`Error starting server: ${err.message}`, 'server.log');
});

