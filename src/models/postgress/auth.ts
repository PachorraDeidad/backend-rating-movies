import { accessConfig } from '../../config/env.config'
import sql from '../../services/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { newUser, PublicData, reqLogIn, ResLogin, TempOtp, User } from '../../types/auth'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AccessModel {
  static async findEmail (email: string): Promise<boolean> {
    const [findEmail] = await sql<[User?]>`SELECT * FROM "users" WHERE email = ${email}`
    if (findEmail === undefined) return false
    return true
  }

  static async findUsername (username: string): Promise<boolean> {
    const [findUsername] = await sql<[User?]>`SELECT * FROM "users" WHERE username = ${username}`
    if (findUsername === undefined) return false
    return true
  }

  static async saveTempOTP (input: TempOtp): Promise<void> {
    await sql`DELETE FROM "otps" WHERE email = ${input.email}`
    await sql`INSERT INTO "otps"(email, otp_code, expires_at) VALUES
    (${input.email}, ${input.storedOtp}, ${input.otpExpires})`
  }

  static async findTempOTP (email: string): Promise<TempOtp> {
    const [otpData] = await sql<[TempOtp]>`SELECT otp_code as "storedOtp", expires_at as "otpExpires" FROM "otps" WHERE email = ${email}`

    return otpData
  }

  static async deleteTempOTP (email: string): Promise<void> {
    await sql`DELETE FROM "otps" WHERE email = ${email}`
  }
  // singup

  static async signUp (input: newUser): Promise<User> {
    const [idResult] = await sql`SELECT gen_random_uuid() as uuid;`

    const hashPassword = await bcrypt.hash(input.password, accessConfig.salt_rounds)
    const id = idResult.uuid

    await sql`
      INSERT INTO "user"(id, name, username, password, email) VALUES 
      (${id}, ${input.name}, ${input.username}, ${hashPassword}, ${input.email})
    `

    const [newUser] = await sql<[User]>`SELECT id, name, username, password, email, profile_pic_url, cover_pic_url FROM "users" WHERE id = ${id}`
    return newUser
  }

  static async getUserByUsername (username: string): Promise<PublicData> {
    const [user] = await sql<[PublicData]>`
    SELECT id, email, username, name, profile_pic_url FROM "users"
    WHERE username = ${username}`
    return user
  }

  static async getUserByEmail (email: string): Promise<PublicData> {
    const [user] = await sql<[PublicData]>`
    SELECT id, email, username, name, profile_pic_url FROM "users"
    WHERE email = ${email}`
    return user
  }

  // logIn
  static async LogInWithEmail (password: string, email: string): Promise<Boolean> {
    const [user] = await sql<[User]>`
      SELECT password FROM "users"
      WHERE email = ${email}
    `
    return await this.comparePassword(password, user.password)
  }

  static async LogInWithdUsername (password: string, username: string): Promise<Boolean> {
    const [user] = await sql<[User]>`
      SELECT password FROM "users"
      WHERE username = ${username}
    `
    return await this.comparePassword(password, user.password)
  }

  static async comparePassword (password: string, hashPassword: string): Promise<Boolean> {
    const isvalid = await bcrypt.compare(password, hashPassword)
    return isvalid
  }

  static async logIn (input: reqLogIn): Promise<ResLogin> {
    let publicData: PublicData | undefined

    if (input.email === undefined) publicData = await this.getUserByUsername(input.username)

    if (input.username === undefined) publicData = await this.getUserByEmail(input.email)

    if (publicData === undefined) throw new Error('Usuario no encontrado.')

    const token = jwt.sign(
      { id: publicData.id, username: publicData.username, email: publicData.email },
      accessConfig.secret_jwt_key,
      {
        expiresIn: '2m'
      }
    )

    const refreshToken = jwt.sign(
      { id: publicData.id, username: publicData.username },
      accessConfig.secre_jwt_refresh_key,
      {
        expiresIn: '7d'
      }
    )
    await this.saveRefreshToken(publicData.id, refreshToken)
    return { token, refreshToken, publicData }
  }

  static async saveRefreshToken (userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 días de validez

    await sql`
      INSERT INTO "refresh_tokens"(user_id, refresh_token, expires_at) 
      VALUES (${userId}, ${refreshToken}, ${expiresAt})
    `
  }

  static async findRefreshToken (refreshToken: string): Promise<boolean> {
    const [token] = await sql`
      SELECT refresh_token FROM "refresh_tokens" 
      WHERE refresh_token = ${refreshToken} 
      AND expires_at > NOW()
    `
    return token !== undefined
  }

  static async deleteExpiredRefreshTokens (): Promise<void> {
    await sql`
      DELETE FROM "refresh_tokens" 
      WHERE expires_at <= NOW()
    `
  }
}
