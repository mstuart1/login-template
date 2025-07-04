import { Router } from 'express'
import * as MetricsController from './metrics.controller'
import { CreateMetricSchema } from './metrics.schemas'
import { validate } from '../lib/middlewares'

module.exports = (app: any) => {

const router = Router()
router
.post('/', MetricsController.create)
.get('/', MetricsController.getMetrics)

app.use("/metrics", router)
}
