import jwt from 'jsonwebtoken'
import { accessConfig } from '../../config/env.config'
import otpGenerator from 'otp-generator'
import { ConfirmationToken, newUser } from '../../types/auth'

const expirationTime = '15m'

export const generateConfirmationToken = (userData: newUser): ConfirmationToken => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const token = jwt.sign(
    {
      ...userData,
      otp
    },
    accessConfig.secret_jwt_key,
    { expiresIn: expirationTime }
  )

  return { token, otp }
}

export const generateOtpToken = (email: string): ConfirmationToken => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const payload = {
    email,
    otp
  }

  // Crear token con expiración (5 minutos, por ejemplo)
  const token = jwt.sign(payload, accessConfig.secret_jwt_key, { expiresIn: '10m' })

  return { token, otp } // Retorna el token y el OTP
}

export const codeGenerator = (): string => {
  const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false })
  return otp
}
