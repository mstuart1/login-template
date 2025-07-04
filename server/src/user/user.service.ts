import prisma from "../lib/prisma"


// Exclude keys from user
function exclude(
  user: any,
  keys: any,
) {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key))
  )
}

export const findUserByEmail = async (email: string) => {
  console.log('@@@@@@@@ findUserByEmail @@@@@@@', email)
  try {
    const user =  await prisma.user.findFirst({ where: { email }, include: { projects: true, organization: true } })
    console.log('found user', user)
    return user
  } catch (err) {
    console.log('findUserByEmail error', err)
  }
}


export const createUser = async (
  user:any
) => {
  console.log('@@@@@@@@ createUser @@@@@@@', user)
  try {
    let newUser =  await prisma.user.create({
      data: user,
      select: {
        id: true,
        email: true,
      }
    })
    console.log('user', newUser)
    return newUser
  } catch (err){
    console.log('createUser error', err)
  
  }
  
}

export const updateUser = async (userId: string, data: {}) => {
  console.log('@@@@@@@@ updateUser @@@@@@@')
  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
      // select: { id: true, email: true, firstName: true, lastName: true, resetToken: true }
    })
  } catch (err) {
    console.log('updateUser error', err)
  
  }
 
}

export const getAllUsers = async (query:{}) => {
  console.log('@@@@@@@@ getAllUsers @@@@@@@', query)
  try {
    
    let allData = await prisma.user.findMany({...query, include: {organization: true, tokens: true}})

    return allData.map((user) => exclude(user, ['password']))
  } catch (err) {
    console.log('getAllUsers error', err)
  }
  
}

export const getUserById = async (userId: string) => {
  console.log('@@@@@@@@ getUserById @@@@@@@', userId)
  try {
    let data = await prisma.user.findUnique({ where: { id: userId }, include: { projects: true, organization: true } })
    return exclude(data, ['password'])
  } catch (err) {
    console.log('getUserById error', err)
  }
  
}

export const countUsers = async (query: {}) => {
  console.log('@@@@@@@@ countUsers @@@@@@@', query)
  try {
    return await prisma.user.count(query)
  } catch (err) {
    console.log('countUsers error', err)
  }
}

export const getUserByRefreshToken = async (refreshToken: string) => {
  console.log('@@@@@@@@ getUserByRefreshToken @@@@@@@', refreshToken)
  try {
    let foundToken = await prisma.user.findFirst({
      where: { 
        tokens: {
          some: {
            token: refreshToken
          }
        }
      }
    })
    console.log('🌟 found token ', foundToken)
    return foundToken
  } catch (err) {
    console.log('getUserByRefreshToken error', err)
  }
}