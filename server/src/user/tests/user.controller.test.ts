import * as UserController from '../user.controller'
import * as UserService from '../user.service'
import * as AuthService from '../../auth/auth.service'
import type { Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'node:test'

vi.mock('user/user.service', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn()
}))

vi.mock('auth/auth.service', () => ({
  generateJWT: vi.fn()
}))


vi.mock('lib/utility-classes', () => ({
  AppError: class {
    constructor(public type: string, public message: string) {}
  }
}))

describe('user.controller', () => {
    let request: Request
  let response: Response
  const next = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response
    request = {
      body: {
        id: '1',
      }
    } as Request
  })
    describe('create', () => {
    it('should throw a validation error if a user already exists with username', async () => {
      vi.mocked(UserService.findUserByEmail).mockResolvedValueOnce({
        id: "1",
        email: 'testusername@test.edu',
        firstName: 'testy', 
        lastName: 'testerson',
        role: 'DATAENTRY',
        organizationId: '1',
        active: true,
        deletedAt: null,
        resetToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'hashedpass',
      })

      await UserController.create(request, response, next)

      expect(UserService.findUserByEmail).toHaveBeenCalledWith(
        'testusername@test.edu'
      )
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it('should create a new user if username not taken', async () => {
      vi.mocked(UserService.findUserByEmail).mockResolvedValueOnce(null)
      vi.mocked(AuthService.generateJWT).mockReturnValueOnce('testtoken')
      await UserController.create(request, response, next)

      expect(UserService.createUser).toHaveBeenCalledWith(request.body)
    })

    it('should create a session token for the new user', async () => {
      vi.mocked(UserService.findUserByEmail).mockResolvedValueOnce(null)
      vi.mocked(AuthService.generateJWT).mockReturnValueOnce('testtoken')
      await UserController.create(request, response, next)

      expect(AuthService.generateJWT).toHaveBeenCalledWith('testtoken')
    })

    it('should respond to the request with a message, the user, and the token', async () => {
      vi.mocked(UserService.findUserByEmail).mockResolvedValueOnce(null)
      vi.mocked(AuthService.generateJWT).mockReturnValueOnce('testtoken')
      await UserController.create(request, response, next)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        message: `Registered successfully`,
        user: {
          id: 1,
          email: 'testusername@test.edu',
        },
        token: 'testtoken'
      })
    })
  })
  describe('getAll', () => {
    it('should respond to the request with a message and the users', async () => {
      vi.mocked(UserService.getAllUsers).mockResolvedValueOnce([
        {
          id: "1",
          firstName: "Testy",
          lastName: "Tester",
          email: "testy@test.com",
          password: "$2y$10$QlLafjLnbcJehU1zdHmlDeWkLuwffsPnVOArSJp9DY9CWGwBQro42",
          active: true,
          role: "DATAENTRY",
          resetToken: null,
          organizationId: "ed67ee2b-77ff-4389-adb4-71f3f242274a",
          createdAt: "2024-06-18T11:50:32.196Z",
          updatedAt: "2024-06-18T11:50:32.196Z",
          deletedAt: null
          }
      ])
    })
  })

}
)


  

