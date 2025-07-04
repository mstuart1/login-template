import type { CreateSchema } from './user.schemas'
import * as UserService from './user.service'
// import * as AuthService from '../auth/auth.service'
import type { Request, RequestHandler } from 'express'
import { AppError } from '../lib/utility-classes'
import { sendEmail } from '../helpers/mailHelper'


export const create: RequestHandler = async (
  req: Request<unknown, unknown, CreateSchema>,
  res,
  next
) => {
  try {
    const userData = {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      organizationId: req.body.organizationId,
      role: req.body.role
    }

    if (await UserService.findUserByEmail(userData.email)) {
      return next(
        new AppError('validation', 'A user already exists with that username')
      )
    }

    const newUser = await UserService.createUser(userData)
    console.log('******** new user *************', newUser)
    if (newUser) {
      const token =
        // AuthService.generateJWT(newUser.id) ?? 
        'NOTOKEN'
      console.log('******** token *************', token)
      const freshUser = await UserService.updateUser(newUser.id, { resetToken: token })
      console.log('******** fresh user *************', freshUser)
      if (freshUser?.email) {
        let mailContent = {
          recipients: [freshUser.email],
          subject: 'Welcome to the Water Resource Management Project Management Portal',
          message: `<p>Welcome to the portal.  Click <a href="${process.env.CLIENT_URL}/reset/${token}">here</a> to set up your password.</p>`,
        }
        sendEmail(mailContent)
      }
      res.status(200).json({
        message: `Registered successfully`,
        user: freshUser,
        token
      })
    }

  } catch (error) {
    next(new AppError('server', 'Internal server error'))
  }

}

export const getAll: RequestHandler = async (
  req: any,
  res,
  next
) => {
  console.log('@@@@@@@@. getAllUsers. @@@@@@@@@')
  const query = req.query
  // console.log('query', query)
  const { skip, take } = query
  // console.log('skip', skip, 'take', take)
  delete query.skip
  delete query.take
  delete query.token

  //  if (!req.user) {
  //       // return next(new AppError('auth', 'Unauthorized'))
  //       return next(new AppError('validation', 'Unauthorized'))
  //     }
  let users;
  try {
    switch (req.user?.role) {
      case 'DEPADMIN': // assumed has access to all users
        users = await UserService.getAllUsers({ skip: Number(skip), take: Number(take), where: { ...query, deletedAt: null } })
        break;

      case 'DIVADMIN': // assumed has access to all users in the organization
        users = await UserService.getAllUsers({
          skip: Number(skip),
          take: Number(take),
          where: {
            deletedAt: null,
            organizationId: req.user.organizationId,
          },
        })
        break;
      case 'PROJECTADMIN': // assumed has access to all users in multiple assigned projects
        users = await UserService.getAllUsers({
          skip: Number(skip),
          take: Number(take),
          where: {
            deletedAt: null,
            projects: {
              every: {
                id: { in: req.user.projects.map((project: any) => project.id) }
              }
            }
          }
        })
        break;
      case 'DATAADMIN': // assumed has access to all users in one project
        users = await UserService.getAllUsers({ skip: Number(skip), take: Number(take), where: { deletedAt: null, projects: { where: { id: req.user.projects[0].id } } } })
        break;
      case "DATAENTRY": // assumed has access to self only
        throw new AppError('validation', 'Unauthorized')
      default:
        // return null
        users = await UserService.getAllUsers({ skip: Number(skip), take: Number(take), where: { ...query, deletedAt: null } })
    }
    res.status(200).json({
      message: `Found successfully`,
      users,
    })
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    next(new AppError('server', 'Internal server error'))
  }

}

export const update: RequestHandler = async (
  req: Request<unknown, unknown, { id: string }>,
  res,
  next
) => {
  try {
    const data = req.body
    const existing = await UserService.getUserById(data.id)
    if (!existing) {
      return next(new AppError('validation', 'Account not found.'))
    }
    const user = await UserService.updateUser(data.id, data)
    res.status(200).json({
      message: `Found successfully`,
      user,
    })

  } catch (error) {
    next(new AppError('server', 'Internal server error'))
  }
}

export const getOne: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params

    const user = await UserService.getUserById(id)
    res.status(200).json({
      message: `Found successfully`,
      user,
    })
  } catch (error) {
    next(new AppError('server', 'Internal server error'))
  }

}

export const getByToken: RequestHandler = async (req: any, res, next) => {
  console.log('getUserByToken')
  let user = req.user
  try {
    res.status(200).json({
      message: `Found successfully`,
      user,
    })
  } catch (error) {
    next(new AppError('server', 'Internal server error'))
  }
}

export const countUsers: RequestHandler = async (req: any, res, next) => {
  console.log('counting users')

  if (!req.user) {
    // return next(new AppError('auth', 'Unauthorized'))
    return next(new AppError('unauthorized', 'Unauthorized - no JWT user'))
  }
  let count;
  let {id: userId, role, organizationId, projects} = req.user;
  try {
    if (!userId || !role) {
          return next(new AppError('unauthorized', 'Unauthorized - no userId or role'))
        }
    
      
    switch (role) {
      case 'DEPADMIN': // assumed has access to all samples
        count = await UserService.countUsers({ where: { deletedAt: null } })
        break;

      case 'DIVADMIN': // assumed has access to all samples in the organization
        count = await UserService.countUsers({
          where: {
            deletedAt: null,
            organizationId: organizationId,
          },
        })
        break;
      case 'PROJECTADMIN': // assumed has access to all samples in multiple assigned projects
        count = await UserService.countUsers({
          where: {
            deletedAt: null,
            projects: {
              every: {
                id: { in: projects.map((project: any) => project.id) }
              }
            }
          }
        })
        break;
      case 'DATAADMIN': // assumed has access to all samples in one project
        count = await UserService.countUsers({ where: { deletedAt: null, projects: { where: { id: projects[0].id } } } })
        break;
      case "DATAENTRY": // assumed has access to own samples
        return null
      default:
        return null
    
  }
    res.status(200).json({
      message: `Found successfully`,
      count,
    })
  } catch (error) {
    next(new AppError('server', 'Internal server error'))
  }
}
export const getCurrentUser: RequestHandler = async (req: any, res, next) => {
  console.log('@@@@@@@@@  getCurrentUser  @@@@@@@@@', req.user)
  let user = req.user
  console.log('user', user)
  try {
    if (!user) {
      return next(new AppError('validation', 'Unauthorized'))
    }
    res.status(200).json({
      message: `Found successfully`,
      user,
    })
  } catch (error) {
    next(new AppError('server', 'Internal server error'))
  }
} 