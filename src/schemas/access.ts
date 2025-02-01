import { AccessModel } from '../models/postgress/auth'
import { ValidationError, newUser, Result, reqLogIn, OtpErrors } from '../types/auth'

const isString = (inputFromRequest: any, param: string): string | null => {
  if (typeof inputFromRequest !== 'string') return `the ${param} must be a string`
  return null
}

const minLength = (inputFromRequest: any, min: number, param: string): string | null => {
  if (inputFromRequest.length < min) return `The ${param} must be longer than ${min} characters.`
  return null
}

const maxLength = (inputFromRequest: any, max: number, param: string): string | null => {
  if (inputFromRequest.length > max) return `The ${param} must be smaller than ${max} characters.`
  return null
}

const isEmailFormat = (username: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(username)
}

const validateEmail = async (inputFromRequest: any, isAsync: boolean): Promise<string | null> => {
  const errorIsString = isString(inputFromRequest, 'email')
  if (errorIsString != null) return errorIsString

  const errorMaxLength = maxLength(inputFromRequest, 50, 'email')
  if (errorMaxLength != null) return errorMaxLength

  if (!(isEmailFormat(inputFromRequest))) return 'The email format is not allowed.'

  const findEmail = await AccessModel.findEmail(inputFromRequest)
  if (findEmail && isAsync) return 'The email has been used already'
  if (!findEmail && !isAsync) return 'The email has not exist'
  return null
}

const validatePassword = (inputFromRequest: any): string | null => {
  const errorIsString = isString(inputFromRequest, 'password')
  if (errorIsString != null) return errorIsString

  const errorMinLength = minLength(inputFromRequest, 6, 'password')
  if (errorMinLength != null) return errorMinLength

  const errorMaxLength = maxLength(inputFromRequest, 20, 'password')
  if (errorMaxLength != null) return errorMaxLength

  const UpperCaseRegex = /[A-Z]/
  const LowerCaseRegex = /[a-z]/
  const NumberRegex = /\d/

  if (!UpperCaseRegex.test(inputFromRequest)) return 'The password must contain at least an uppercase letter.'

  if (!LowerCaseRegex.test(inputFromRequest)) return 'The password must contain at least a lowercase letter.'

  if (!NumberRegex.test(inputFromRequest)) return 'The password must contain at least a number.'

  return null
}

const validateUsername = async (userNameFromRequest: any, isAsync: boolean): Promise<string | null> => {
  const UsernameRegex = /^[a-zA-Z0-9_]+$/
  if (!(UsernameRegex.test(userNameFromRequest))) return 'Your username format is not allowed'

  const errorIsString = isString(userNameFromRequest, 'username')
  if (errorIsString != null) return errorIsString

  const errorMinLength = minLength(userNameFromRequest, 6, 'username')
  if (errorMinLength != null) return errorMinLength

  const errorMaxLength = maxLength(userNameFromRequest, 20, 'username')
  if (errorMaxLength != null) return errorMaxLength

  const errorUsernameHasAlreadyUsed = await AccessModel.findUsername(userNameFromRequest)
  if (errorUsernameHasAlreadyUsed && isAsync) return 'The username has been alreay used'
  if (!errorUsernameHasAlreadyUsed && !isAsync) return 'The username has not exist'
  return null
}

const validateName = (userNameFromRequest: any): string | null => {
  const errorIsString = isString(userNameFromRequest, 'name')
  if (errorIsString != null) return errorIsString

  const errorMinLength = minLength(userNameFromRequest, 6, 'name')
  if (errorMinLength != null) return errorMinLength

  const errorMaxLength = maxLength(userNameFromRequest, 20, 'name')
  if (errorMaxLength != null) return errorMaxLength

  return null
}

export const singupSchema = async (input: any): Promise< Result > => {
  const errors: ValidationError = {}
  let success = true

  let error = validateName(input.name)
  if (error !== null) {
    errors.name = error
    success = false
  }
  error = await validateUsername(input.username, true)
  if (error !== null) {
    errors.username = error
    success = false
  }

  error = validatePassword(input.password)
  if (error !== null) {
    errors.password = error
    success = false
  }

  error = await validateEmail(input.email, true)
  if (error !== null) {
    errors.email = error
    success = false
  }

  const data: newUser = {
    name: input.name,
    email: input.email,
    username: input.username,
    password: input.password
  }
  const result: Result = {
    errors,
    data,
    success
  }
  return result
}

export const verifyCodeSchema = async (otpCode: any, otpData: any): Promise<Result> => {
  const errors: OtpErrors = {}
  let success = true

  if (otpCode == null) {
    errors.storedOtp = 'Verification code NOT FOUND'
    return {
      errors,
      data: { otpCode, storedOtp: 'undefined', otpExpires: 'undefined' },
      success: false
    }
  }

  if (otpData == null) {
    errors.storedOtp = 'Verification code was not found or is incorrect'
    return {
      errors,
      data: { otpCode, storedOtp: 'undefined', otpExpires: 'undefined' },
      success: false
    }
  }
  const { storedOtp, otpExpires } = otpData
  if (storedOtp !== otpCode) {
    errors.otpCode = 'Verification code is incorrect'
    success = false
  }

  if (Date.now() > otpExpires) {
    errors.storedOtp = 'Verification code has already expired'
    success = false
  }

  return {
    errors,
    data: { otpCode, storedOtp, otpExpires },
    success
  }
}

export const validateLoginData = async (input: any): Promise<Result> => {
  const errors: ValidationError = {}
  let success = true

  if (input.email === undefined && input.username === undefined) {
    errors.general = 'must introduce email or username'
    success = false
  }

  const error = validatePassword(input.password)
  if (error !== null) {
    errors.password = error
    success = false
  }

  if (input.username !== undefined) {
    const error = await validateUsername(input.username, false)
    if (error !== null) {
      errors.username = error
      success = false
    } else {
      const isvalidPassowrd = await AccessModel.LogInWithdUsername(input.password, input.username)
      if (isvalidPassowrd === false) {
        errors.password = 'Password is invalid'
        success = false
      }
    }
  }

  if (input.email !== undefined) {
    const error = await validateEmail(input.email, false)
    if (error !== null) {
      errors.email = error
      success = false
    } else {
      const isvalidPassowrd = await AccessModel.LogInWithEmail(input.password, input.email)
      if (isvalidPassowrd === false) {
        errors.password = 'Password is invalid'
        success = false
      }
    }
  }

  const data: reqLogIn = {
    email: input.email,
    username: input.username,
    password: input.password
  }
  const result: Result = {
    errors,
    data,
    success
  }
  return result
}
