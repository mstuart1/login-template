import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/utility-classes';

const verifyJWT = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        console.error('verifyJWT Authorization header not found');
        return res.sendStatus(401); // Unauthorized
    }
    console.log('verifyJWT - authHeader', authHeader); // Bearer token
    const token = authHeader.split(' ')[1];
    if (!token) {
        console.error('verifyJWT token not found in Authorization header');
        return res.sendStatus(401);}
    jwt.verify(
        token, 
        process.env.ACCESS_TOKEN_SECRET as string, 
        (err:any, decoded:any) => {
        if (err) {
            console.error('JWT verification error:', err);
            return next(new AppError('forbidden', 'Error decoding JWT'));
        }
        req.user = decoded; // Attach the decoded user info to the request object
        next();
    });
}

export default verifyJWT;