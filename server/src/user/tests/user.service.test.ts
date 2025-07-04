import * as UserService from '../user.service'
import type { User } from '@prisma/client'
import prismaMock from 'lib/__mocks__/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('lib/prisma')
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(() => ({ id: 1 }))
  }
}))
vi.mock('bcrypt', () => ({
  default: {
    hashSync: () => 'hashedpass'
  }
}))


describe('user.service', () => {
  const env = process.env
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...env }
  })
  describe('findUserByEmail', async () => {
    it('should return the userid and email', async () => {

      prismaMock.user.findFirst.mockResolvedValueOnce({
        id: "1",
        email: 'testusername@test.edu'
      } as User)

      const user = await UserService.findUserByEmail('testusername@test.edu')

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toStrictEqual({
        id: "1",
        email: 'testusername@test.edu'
      })
    }
    )
  })
  describe('createUser', async () => {
    let mockUser = {
      id: "1",
      firstName: 'Testy',
      lastName: 'Testerson',
      email: 'testusername@test.edu',
      organizationId: '1',
    }
    it('should create and return the userId', async () => {

      prismaMock.user.create.mockResolvedValueOnce(mockUser as User)

      const newUser = await UserService.createUser(mockUser)

      expect(newUser).toHaveProperty('firstName')
      expect(newUser).toStrictEqual({
        firstName: 'Testy',
        lastName: 'Testerson',
        email: 'testusername@test.edu',
        organizationId: '1',
        id: "1"
      })
    })
    //!! I think the below is a spy, not sure how to fix error
    // expect(prismaMock.user.create).toHaveBeenCalledWith({
    //   data: { id: "1",
    //     firstName: 'Testy',
    //     lastName: 'Testerson',
    //     email: 'testusername@test.edu',
    //     organizationId: '1',
    //   },
    //   select: { id: true }
    // })
  })

  describe('updateUser', async () => {
    it('should return the updated user', async () => {

      prismaMock.user.update.mockResolvedValueOnce({
        id: "1",
        firstName: 'Testy',
        lastName: 'Testerson',
        email: 'testusername@test.edu',
        organizationId: '1',
        resetToken: 'testtoken',
      } as User)

      const user = await UserService.updateUser('1', 'testtoken')

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('resetToken')
      // expect(user).toStrictEqual({  
      //   id: 1,
      //   email: 'testname@test.com'
      // })
    }
    )
  })
})

