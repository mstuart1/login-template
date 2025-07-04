import { Router } from 'express'
import * as AuthController from './auth.controller'
import { AuthenticateSchema, SigninSchema } from './auth.schemas'
import { validate } from '../lib/middlewares'

module.exports = (app: any) => {

const router = Router()
router
.post('/login', validate(SigninSchema), AuthController.login)
.post('/',validate(AuthenticateSchema), AuthController.authenticate)
.get('/refresh', AuthController.refreshToken)

app.use("/authenticate", router)
}
