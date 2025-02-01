import { Request, Response } from 'express'
import { transporter } from '../../services/nodamailer'
import { codeGenerator } from '../../models/token/token'
import { singupSchema, verifyCodeSchema } from '../../schemas/access'
import { newUser } from '../../types/auth'

export class AccessController {
  readonly AccessModel: any

  constructor ({ accessModel }: { accessModel: any }) {
    this.AccessModel = accessModel
  }

  verifySignUpData = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await singupSchema(req.body)
      if (!result.success) {
        res.status(400).json(result.errors)
        return
      }
      res.json({ succes: result.success }).status(200)
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar la informacion' })
    }
  }

  sendVerificationCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, username } = req.body as newUser

      const storedOtp = codeGenerator()
      const otpExpires = Date.now() + 5 * 60 * 1000 // Expira en 5 minutos

      await this.AccessModel.saveTempOTP({ email, storedOtp, otpExpires })

      await transporter.sendMail({
        from: 'Registro Blockbuster <noreply@blockbuster.com>',
        to: email,
        subject: 'Código de Verificación',
        html: `
            <h1>Confirma tu registro</h1>
            <p>Hola ${username},</p>
            <p>Tu código de verificación es: <strong>${storedOtp}</strong></p>
            <p>Este código expirará en 5 minutos.</p>
          `
      })

      res.status(200).json({ message: 'Código enviado. Revise su correo.' })
    } catch (error) {
      res.status(500).json({ error: 'Error al enviar el código de verificación.' })
    }
  }

  verifyCodeAndSignUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otpCode } = req.body

      const otpData = await this.AccessModel.findTempOTP(email)

      const result = await verifyCodeSchema(otpCode, otpData)

      if (!result.success) {
        res.status(400).json(result.errors)
        return
      }

      await this.AccessModel.deleteTempOTP(email)

      const newUser = await this.AccessModel.signUp(req.body)

      res.status(200).json({ message: 'Usuario registrado exitosamente.', user: newUser })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error al verificar el código o registrar el usuario.' })
    }
  }
}
