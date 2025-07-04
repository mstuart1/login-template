import jwt from 'jsonwebtoken'
import { TokenType } from '@prisma/client'
import prisma from '../lib/prisma'

interface APITokenPayload {
  tokenId: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_JWT_SECRET'
const JWT_ALGORITHM = 'HS256'

// Generate a random 8 digit number as the email token
export const generateEmailCode = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

export const createToken = async (data: any): Promise<any> => {
  try {
    console.log(' @@@@@@@ createToken @@@@@@', data)
    const createdToken = await prisma.token.create({
      data
      // : {
      //   token: emailToken,
      //   tokenType: TokenType.EMAIL,
      //   expiration,
      //   user: {
      //     connect: {
      //      email, 
      //     },
      //   },
      // },
    })
    // console.log('createdToken', createdToken)
    return createdToken
  } catch (error) {
    console.log('error', error)
  }

}

export const getToken = async (token: string): Promise<any> => {
  console.log(' @@@@@@@ getToken @@@@@@', token)
  try {
    // Get short lived email token
    const fetchedToken = await prisma.token.findUnique({
      where: {
        token ,
      },
      include: {
        user: true,
      },
    })
console.log('fetchedToken', fetchedToken )
    return fetchedToken
  } catch (error) {
    console.log('getEmailToken error: invalid email token', error)
  }
}

export const createApiToken = async (expiration: any, email: string): Promise<any> => {
  try {
    const apiToken = await prisma.token.create({
      data: {
        token: 'aldfkjdalfkajd;flkaj;d',
        tokenType: TokenType.API,
        expiration,
        user: {
          connect: {
            email
          },
        },
      }
    })

    return apiToken
  } catch (error) {
    console.log('error', error)
  }
}

export const invalidateEmailToken = async (emailTokenId: string): Promise<any> => {
  console.log(' @@@@@@@ invalidateEmailToken @@@@@@')
  try {
    await prisma.token.update({
      where: {
        id: emailTokenId,
      },
      data: {
        valid: false,
      },
    })
    return
  } catch (error) {
    console.log('error', error)
  }
}

export const generateAuthToken = (tokenId: number): string => {
  console.log(' @@@@@@@ generateAuthToken @@@@@@')
  if (!process.env.JWT_SECRET) {
    console.log('The JWT_SECRET env var is not set. This is unsafe! If running in production, set it.')
  }

  const jwtPayload = { tokenId }

  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    noTimestamp: true,
  })
}

export const getTokenById = async (tokenId: string): Promise<any> => {
  try {
    // Fetch the token from DB to verify it's valid
    const fetchedToken = await prisma.token.findUnique({
      where: {
        id: tokenId,
      },
      include: {
        user: {
          include:{
            organization: true,
            projects: true
          }
        },
      },
    })

    // Check if token could be found in database and is valid
    if (!fetchedToken || !fetchedToken?.valid) {
      return { isValid: false, errorMessage: 'Invalid token' }
    }

    // Check token expiration
    if (fetchedToken.expiration < new Date()) {
      return { isValid: false, errorMessage: 'Token expired' }
    }
    return fetchedToken
  } catch (error) {
    console.log('error', error)
  }
}
export const deleteToken = async (query: any): Promise<any> => {
  try {
    await prisma.token.deleteMany(
      query
    )
    return
  } catch (error) {
    console.log('error', error)
  }
}
export const getEmailTokenByUserId = async (userId: string): Promise<any> => {
  try {
    const token = await prisma.token.findFirst({
      where: {
        userId: userId,
        tokenType: TokenType.EMAIL,
      },
    })
    return token
  } catch (error) {
    console.log('error', error)
  }
}

export const updateEmailToken = async (tokenId: string, emailToken: string, expiration: any): Promise<any> => {
  console.log(' @@@@@@@ updateEmailToken @@@@@@', tokenId, emailToken)
  try {
   let freshToken = await prisma.token.update({
      where: {
        id: tokenId,
      },
      data: {
        token: emailToken,
        expiration,
        valid: true,
      },
    })
    return freshToken
  } catch (error) {
    console.log('error', error)
  }
}
export const getApiTokenByUserId = async (userId: string): Promise<any> => {
  console.log(' @@@@@@@ getApiTokenByUserId @@@@@@')
  try {
    const token = await prisma.token.findFirst({
      where: {
        userId: userId,
        tokenType: TokenType.API,
      },
    })
    console.log('token', token)
    return token
  } catch (error) {
    console.log('error', error)
  }
}
export const updateApiToken = async (tokenId: string, expiration: any): Promise<any> => {
  console.log(' @@@@@@@ updateApiToken @@@@@@', tokenId)
  try {
    let foundToken = await prisma.token.findFirst({where: {id: tokenId}})
    console.log('foundToken', foundToken)
    let freshToken = await prisma.token.update({
      where: {
        id: foundToken?.id,
      },
      data: {
        expiration,
      },
    })
    return freshToken
  } catch (error) {
    console.log('error', error)
  }
}
