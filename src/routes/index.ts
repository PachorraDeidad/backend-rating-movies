import { Router } from 'express'
import { createSigUpRouter } from './auth/signup'
import { createLogInRouter } from './auth/login'
import { createMovieRouter } from './movie/movie'
import { AccessModel } from '../models/postgress/auth'
import { MovieModel } from '../models/postgress/movie'

const routes = Router()

routes.use('/signup', createSigUpRouter({ accessModel: AccessModel }))

routes.use('/login', createLogInRouter({ accessModel: AccessModel }))

routes.use('/movie', createMovieRouter({ movieModel: MovieModel }))

export default routes
