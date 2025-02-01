import sql from '../../services/db'
import { Movie } from '../../types/movie'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MovieModel {
  static async getAllMovies (email: string): Promise<Movie[]> {
    const movies = await sql<Movie[]>`
    SELECT id, title, overview, release_date, popularity, vote_average, vote_count, poster_path, backdrop_path, original_language 
    FROM movies 
    WHERE id>499 
    ORDER BY id LIMIT 10`

    return movies
  }
}
