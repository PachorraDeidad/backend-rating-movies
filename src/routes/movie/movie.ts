import { Router } from 'express'
import { MovieController } from '../../controllers/movie/movie'

export const createMovieRouter = ({ movieModel }: { movieModel: any }): Router => {
  const movieController = new MovieController({ movieModel })

  const movieRouter = Router()

  movieRouter.get('/', movieController.movie)
  movieRouter.get('/:id', movieController.movieById)

  return movieRouter
}
