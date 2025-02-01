import axios from 'axios'
import { moviesConfig } from '../../config/env.config'

const api = axios.create({
  baseURL: moviesConfig.base_url,
  params: {
    api_key: moviesConfig.apy_key,
    language: 'es-ES',
    page: 1

  }
})

export default api
