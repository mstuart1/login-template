import { AppError } from "../lib/utility-classes"
import * as UserService from "../user/user.service"

const currentUserInfo = async (req: any, res: any, next: any) => {
//   console.log('@@@@@@@@ currentUserInfo @@@@@@@')
//   console.log('req.user', req.user)
//   console.log('req.user.UserInfo', req.user?.UserInfo)  

if (!req.user) {
    // return next(new AppError('auth', 'Unauthorized'))
    return next(new AppError('unauthorized', 'Unauthorized - no JWT user'))
  } 
  let {id: userId, role} = req.user.UserInfo;
  try {

        if (!userId || !role) {
          return next(new AppError('unauthorized', 'Unauthorized - no userId or role'))
        }
    
        const user = await UserService.getUserById(userId) as any
    
        if (!user) {
          return next(new AppError('server', 'User not found'))
        } 
        req.user = user
        return next()
    }
    catch (error) {
      console.log('currentUserInfo error', error)
      return next(new AppError('server', 'Internal server error'))
    }
    
}

export default currentUserInfo