import { RequestHandler } from "express"
import { AppError } from "../lib/utility-classes"
import jwt from 'jsonwebtoken'
import { ApiTokenSchema } from "../auth/auth.schemas"
import { getTokenById } from "../auth/auth.service"
import { Request } from 'express';
import { Role } from "@prisma/client"

declare module 'express' {

  export interface Request {

    user?: any;

  }
}

export const isDepAdmin: RequestHandler = async (req: Request, res, next) => {
  console.log('isDepAdmin', req.user.role)
   const {role} = req.user
    if (role === Role.DEPADMIN) {
         next()
    } else {
         next(new AppError('unauthorized', 'User is not DEPADMIN'))
    }
}

export const belongsToOrgOrDepAdmin: RequestHandler = async (req: Request, res, next) => {
  // console.log('belongsToOrgOrDepAdmin', req.user)
    const {role} = req.user
     if (role === Role.DEPADMIN || (role === Role.DIVADMIN && req.user.organizationId === req.params.id)) {
         next()
     } else {
          next(new AppError('unauthorized', 'User is not an admin for this organization'))
     }
}

export const isDivAdminorDepAdmin: RequestHandler = async (req: Request, res, next) => {
  // console.log('isDivAdminorDepAdmin', req.user)
    const {role} = req.user
     if (role === Role.DEPADMIN || role === Role.DIVADMIN) {
         next()
     } else {
          next(new AppError('unauthorized', 'User is not a DEPADMIN or DIVADMIN'))
     }
}

export const belongsToProjectOrAdmin: RequestHandler = async (req: Request, res, next) => {
  console.log('belongsToProjectOrAdmin', req.user)
  const currentProjectId = req.params.id
  const projectIds = req.user.projects.map((project:any) => project.id)
    const {role} = req.user
     if ([Role.DEPADMIN, Role.DIVADMIN].includes(role) || projectIds.includes(currentProjectId)) {
         next()
     } else {
          next(new AppError('unauthorized', 'User is not assigned to this project'))
     }
}

