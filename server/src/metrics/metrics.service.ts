import prisma from '../lib/prisma'



export const createMetric = async (data: any): Promise<any> => {
  try {

    return await prisma.metric.create({
      data,
    });
  } catch (error) {
    console.log('error', error)
  }

}

export const getMetrics = async (): Promise<any> => {
  try {
    return await prisma.metric.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10, // limit for performance
    });
  } catch (error) {
    console.log('error', error)
  }
}