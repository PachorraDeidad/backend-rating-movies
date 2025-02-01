import { Router } from 'express'
import { AccessController } from '../../controllers/access/signup'

export const createSigUpRouter = ({ accessModel }: { accessModel: any }): Router => {
  const accessController = new AccessController({ accessModel })

  const signUpRouter = Router()

  signUpRouter.post('/verifySignUpData', accessController.verifySignUpData)

  signUpRouter.post('/sendVerificationCode', accessController.sendVerificationCode)

  signUpRouter.post('/verifyCodeAndSignUp', accessController.verifyCodeAndSignUp)

  return signUpRouter
}
