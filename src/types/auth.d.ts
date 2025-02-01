export interface User {
  id: string
  name: string
  username: string
  password: string
  email: string
  profile_pic_url: string
  cover_pic_url: string
}

export type newUser = Omit<User, 'id' | 'profile_pic_url' | 'cover_pic_url'>

export interface PublicData {
  id: string
  email: string
  username: string
  name: string
  profile_pic_url: string
}

export interface ResLogin {
  token: string
  refreshToken: string
  publicData: PublicData
}

export interface ValidationError {
  name?: string
  username?: string
  password?: string
  email?: string
  general?: string
}

export interface Result {
  errors: object
  data: object
  success: boolean
}

export type reqLogIn =
  | { email: string
    username?: never
    password: string
  }
  | {
    username: string
    email?: never
    password: string
  }

export interface TempOtp {
  email: string
  storedOtp: string
  otpExpires: number
}

export interface OtpErrors {
  storedOtp?: string
  otpExpires?: string
  otpCode?: string
}

export type FindOtp = Pick<TempOtp, 'email' | 'storedOtp'>

export interface ConfirmationToken {
  token: string
  otp: string
}
