import {format} from 'date-fns';
import {v4 as uuid} from 'uuid';
import fs from 'fs';
import {promises as fsPromises} from 'fs';
import path from 'path';
/**
 * Logs events to a specified log file with a timestamp and unique identifier.
 * 
 * @param {string} message - The message to log.
 * @param {string} logName - The name of the log file.
 */
const logEvents = async (message: string, logName: string) => {
  const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  const logFilePath = path.join(__dirname, '..', 'logs', logName);

  try {
    if (!fs.existsSync(path.dirname(logFilePath))) {
      await fsPromises.mkdir(path.dirname(logFilePath), {recursive: true});
    }
    await fsPromises.appendFile(logFilePath, logItem);
  } catch (err) {
    console.error(err);
  }
};

export const logger = (req:any, res:any, next:any) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'request.log');
  console.log('Checking authentication for request:', req.method, req.path);
  next();
}



export default logEvents;
