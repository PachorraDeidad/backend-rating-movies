import { Request, Response } from 'express'

export class MovieController {
  readonly MovieModel: any

  constructor ({ movieModel }: { movieModel: any }) {
    this.MovieModel = movieModel
  }

  movie = async (req: Request, res: Response): Promise<void> => {
    try {
      const movies = await this.MovieModel.getAllMovies()
      res.json(movies)
    } catch (error) {
      console.log(error)
    }
  }

  movieById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    try {
      const movie = await this.MovieModel.getById(id)

      res.status(200).json(movie)
    } catch (error) {
      res.status(500).send({ message: 'something was wrong' })
    }
  }
}
