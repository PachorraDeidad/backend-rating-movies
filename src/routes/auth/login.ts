import { Router } from 'express'
import { AccessController } from '../../controllers/access/login'

export const createLogInRouter = ({ accessModel }: { accessModel: any }): Router => {
  const accessController = new AccessController({ accessModel })

  const logInRouter = Router()

  logInRouter.post('/', accessController.logIn)

  logInRouter.post('/refresh', accessController.refreshToken)
  return logInRouter
}
