import type { Request, RequestHandler } from 'express'
import * as MetricsService from './metrics.service'
import { AppError } from '../lib/utility-classes'


export const create: RequestHandler = async (
  req,
  res,
  next
) => {
    console.log('@@@@@@@@@@@@@. create metric called. @@@@@@@@@@@@@@@@')
  try {
    
    const data = req.body
    await MetricsService.createMetric(data)
    res.status(200).json({ success: true });

  } catch (err) {
    next(new AppError('server', 'Failed to save metric'))
  }

}

export const getMetrics: RequestHandler = async (
  req: Request,
  res: any,
  next: any
) => {
    console.log('@@@@@@@@@@@@@. get metrics called. @@@@@@@@@@@@@@@@')
  try {
    const metrics = await MetricsService.getMetrics()
    res.status(200).json(metrics)
  } catch (err) {
    next(new AppError('server', 'Failed to fetch metrics'))
  }
}   