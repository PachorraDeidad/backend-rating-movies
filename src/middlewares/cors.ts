import { frontendUrl } from '../config/env.config'

export const corsOptions = {
  origin: frontendUrl,
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}
