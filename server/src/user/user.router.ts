import * as UserController from './user.controller'
import { CreateSchema } from './user.schemas'
import { Router } from 'express'
import { validate } from '../lib/middlewares'
import verifyJWT from '../middleware/verifyJWT'
import currentUserInfo from '../middleware/currentUserInfo'

module.exports = (app: any) => {
    const router = Router()

router
.post('/', validate(CreateSchema), UserController.create)
.put('/:id', UserController.update)
.get('/',  UserController.getAll)
.get('/current',  UserController.getCurrentUser)
.get('/count', verifyJWT, currentUserInfo, UserController.countUsers)
.get('/byToken', UserController.getByToken)
.get('/:id', UserController.getOne)

    app.use("/user", router)
}