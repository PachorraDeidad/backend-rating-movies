import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { accessConfig } from '../config/env.config'

export interface Session {
  user: any | null
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session: Session
    }
  }
}

export const tokenMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.access_token
  req.session = { user: null }

  try {
    const decoded = jwt.verify(token, accessConfig.secret_jwt_key)
    req.session.user = decoded
  } catch (error) {
    req.session.user = null
  }
  next()
}

export const decodeConfirmationToken = (token: string): {
  email: string
  name: string
  username: string
  password: string
  confirmationCode: string
} => {
  try {
    return jwt.verify(token, accessConfig.secret_jwt_key) as {
      email: string
      name: string
      username: string
      password: string
      confirmationCode: string
    }
  } catch (error) {
    throw new jwt.JsonWebTokenError('Token inválido o expirado.')
  }
}
