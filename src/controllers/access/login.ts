import { Request, Response } from 'express'
import { validateLoginData } from '../../schemas/access'
import { accessConfig } from '../../config/env.config'
import jwt from 'jsonwebtoken'
export class AccessController {
  readonly AccessModel: any

  constructor ({ accessModel }: { accessModel: any }) {
    this.AccessModel = accessModel
  }

  logIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await validateLoginData(req.body)
      if (!result.success) {
        res.status(400).json(result.errors)
        return
      }

      const { token, publicData, refreshToken } = await this.AccessModel.logIn(result.data)
      res
        .status(200)
        .cookie('access_token', token, {
          secure: true,
          sameSite: 'none',
          httpOnly: true,
          maxAge: 2 * 60 * 1000 // 2 minutos
        })
        .cookie('refresh_token', refreshToken, {
          secure: true,
          sameSite: 'none',
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .send({ publicData })
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({ error: 'Credenciales inválidas' })
        return
      }
      console.error('Error inesperado en logIn:', error)
      res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta nuevamente más tarde.' })
    }
  }

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body

    if (refreshToken === undefined) {
      res.status(400).send('Refresh token is required')
      return
    }

    try {
      const decoded = jwt.verify(refreshToken, accessConfig.secre_jwt_refresh_key) as { id: string, username: string }

      const newAccessToken = jwt.sign(
        { id: decoded.id, username: decoded.username },
        accessConfig.secret_jwt_key,
        { expiresIn: '2m' }
      )
      res.status(200).cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 1000
      }).send({ message: 'New access token sent as a cookie' })
    } catch (error) {
      res.status(403).send('Invalid or expired refresh token')
    }
  }
}
