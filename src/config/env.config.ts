import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}
export const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'

const {
  API_KEY = '',
  BASE_URL = '',
  DATABASE_URL = '',
  SALT_ROUNDS = '',
  SECTRET_JWT_KEY = '',
  SECRET_JWT_REFRESH_KEY = ''
} = process.env

export const moviesConfig = {
  apy_key: API_KEY ?? '',
  base_url: BASE_URL ?? ''
}
export const port = process.env.PORT ?? '0'

export const db = {
  db_url: DATABASE_URL
}

export const accessConfig = {
  salt_rounds: parseInt(SALT_ROUNDS, 10),
  secret_jwt_key: SECTRET_JWT_KEY ?? '',
  secre_jwt_refresh_key: SECRET_JWT_REFRESH_KEY ?? ''
}
