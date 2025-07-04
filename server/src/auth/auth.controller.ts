import { add } from 'date-fns'
import type { Request, RequestHandler } from 'express'
import type { SigninSchema } from './auth.schemas'
import * as AuthService from './auth.service'
import * as UserService from '../user/user.service'
import { AppError } from '../lib/utility-classes'
import { sendEmail } from '../helpers/mailHelper'
import jwt from 'jsonwebtoken'
import { TokenType } from '@prisma/client'

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10
const AUTHENTICATION_TOKEN_EXPIRATION_HOURS = 12

export const login: RequestHandler = async (
  req: Request<unknown, unknown, SigninSchema>,
  res,
  next
) => {
  // console.log('login', req.body)
  try {
    const { email } = req.body

    // does this user exist in the system?
    const user = await UserService.findUserByEmail(email)
    console.log('✅ found user', user)
    if (!user) {
      next(new AppError('validation', 'User not found.'))
    } else {

      const emailToken = AuthService.generateEmailCode()
      const tokenExpiration = add(new Date(), { minutes: EMAIL_TOKEN_EXPIRATION_MINUTES })

      // search for existing token and update, otherwise create new 

      // const existingToken = await AuthService.getEmailTokenByUserId(user.id)

      // let freshEmailToken
      // if (existingToken) {
      // let freshEmailToken = await AuthService.updateEmailToken(existingToken.id, emailToken, tokenExpiration)
      // } else {

      let freshEmailToken = await AuthService.createToken({
        token: emailToken,
        tokenType: TokenType.EMAIL,
        expiration: tokenExpiration,
        user: {
          connect: {
            id: user.id
          }
        }
      })
      // }

      sendEmail({ recipients: [email], subject: 'Login to WRMPM System', message: `Your login code is: ${freshEmailToken.emailToken}.  This code will expire in ${EMAIL_TOKEN_EXPIRATION_MINUTES} minutes.` })

      // todo production: remove email token from response in production
      res.status(200).json({
        message: 'Email message sent.',
        emailToken: freshEmailToken.token,
      })
    }
  } catch (err) {
    next(new AppError('validation', 'Invalid login.'))
  }

}

export const authenticate: RequestHandler = async (req, res, next) => {
  console.log('@@@@@@@@@@@@@. authenticate. @@@@@@@@@@@@@@@@', req.body)
  const cookies = req.cookies;
  console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
  console.log('req.body', req.body);
  const { email, emailToken } = req.body;
  if (!email || !emailToken) return res.status(400).json({ 'message': 'Email and email token are required.' });

  const foundUser = await UserService.findUserByEmail(email);

  if (!foundUser) {
    console.log('Authenticate - No Found User')
    return res.status(401).json({ 'message': 'Unauthorized' });
  }

  // evaluate token
  const fetchedEmailToken = await AuthService.getToken(emailToken)
  if (!fetchedEmailToken?.valid) {

    // await AuthService.deleteToken(emailToken)
    next(new AppError('validation', 'Invalid token'))
  }
  if (fetchedEmailToken.expiration < new Date()) {
    next(new AppError('validation', 'Token expired'))
  }
  // If token matches the user email passed in the payload, generate long lived API token
  if (fetchedEmailToken?.user?.email === email) {
    const role = foundUser.role;
    //     // create JWTs
    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "id": foundUser.id,
          "role": role,
          "org": foundUser.organizationId
        }
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );
    const newRefreshToken = jwt.sign(
      { "id": foundUser.id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '1d' }
    );


    // if we do not have any jwt cookies, no change to db
    // if we do have jwt cookies, we need to remove the old one from the db
    if (cookies?.jwt) {
      await AuthService.deleteToken({ where: { token: cookies.jwt } });
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: false });
    }

    // Saving refreshToken with current user
    await AuthService.createToken({
      token: newRefreshToken,
      tokenType: TokenType.REFRESH,
      expiration: add(new Date(), { hours: AUTHENTICATION_TOKEN_EXPIRATION_HOURS }),
      user: {
        connect: {
          id: foundUser.id,
        },
      },
    });


    console.log (`⏲ refreshToken expiration: ${newRefreshToken}`);
      console.log(`⏲ accessToken expiration: ${accessToken}`);

    // todo in production set secure to true - search this file and change all

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });

    // Send authorization roles and access token to user
     res.json({ accessToken, role, userId: foundUser.id, org: foundUser.organizationId });

  } else {
    console.log('Authenticate - No Matching User email', email)
    res.sendStatus(401);
  }
}

export const refreshToken: RequestHandler = async (req, res, next) => {
  console.log('@@@@@@@@@.  refreshToken called.  @@@@@@@@@@@@@@@@@')
  const cookies = req.cookies;
  // console.log('cookies', cookies);
  // console.log(`cookie available at refreshToken: ${JSON.stringify(cookies)}`);
  if (!cookies?.jwt) {
    console.log('No jwt cookie found');
    return next(new AppError('forbidden', 'No jwt cookie found'));
  }
  const refreshToken = cookies.jwt;

  // todo production change lax to none for all sameSite cookies, change secure to true
  console.log('refreshToken', refreshToken)
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: false });

  // Is refreshToken in db?
  const foundUser = await UserService.getUserByRefreshToken(refreshToken);

  // Detected refresh token reuse! Somone is stealing tokens
  if (!foundUser) {
    // pull the id out of the token to find out who was hacked
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err: any, decoded: any) => {
        if (err) {
          console.log('refreshToken Error decoding refresh token:', err);
          next(new AppError('forbidden', 'Error decoding refresh token'));
        } //Forbidden - we can't decode the token, it is expired or invalid
        // Delete all refresh tokens of hacked user
        const result = await AuthService.deleteToken({ where: { userId: decoded.id } });
        console.log('Hacked user tokens deleted:', result);
      }
    )
    console.log('refreshToken No user found for refresh token');
    return next(new AppError('forbidden', 'No user found for refresh token'));
  }

  // Delete token from db
  // console.log('❌ skipping deleteToken step for refreshToken', refreshToken);
  await AuthService.deleteToken({ where: { token: refreshToken } });

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (err: any, decoded: any) => {
      if (err) {
        // token has already been deleted from the db at the "invalidatedToken" step
      }
      if (err || foundUser.id !== decoded.id) {
        console.log('refreshToken Error decoding refresh token:', err);
        return next(new AppError('forbidden', 'Error decoding refresh token'));
      }

      // Refresh token was still valid
      const role = foundUser.role;
      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "id": decoded.id,
            "role": role,
            "org": foundUser.organizationId
          }
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { "id": foundUser.id, "role": role },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: '1d' }
      );
      // Saving refreshToken with current user

      const result = await AuthService.createToken({
        token: newRefreshToken,
        tokenType: TokenType.REFRESH,
        expiration: add(new Date(), { hours: AUTHENTICATION_TOKEN_EXPIRATION_HOURS }),
        user: {
          connect: {
            id: foundUser.id,
          },
        },
      });
      console.log('result', result);

      console.log (`⏲ refreshToken expiration: ${refreshToken}`)
      console.log(`⏲ accessToken expiration: ${accessToken}`);
      // Creates Secure Cookie with refresh token
      res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: false, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

      res.json({ accessToken, role, userId: foundUser.id, org: foundUser.organizationId });
    }
  );
}

export const logout: RequestHandler = async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content

  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await UserService.getUserByRefreshToken(refreshToken);
  if (!foundUser) {
    // Clear cookie and return
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: false });
    return res.sendStatus(204); // No content
  }

  // Delete refresh token from user
  await AuthService.deleteToken({ where: { token: refreshToken } });

  // Clear cookie
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: false });
  res.sendStatus(204); // No content
}
