import postgres from 'postgres'
import { db } from '../config/env.config'

const connectionString = db.db_url

const sql = postgres(connectionString)

export default sql
