import sql from '../../services/db'
import { Movie } from '../../types/movie'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MovieModel {
  static async getAllMovies (genre: string): Promise<Movie[]> {
    const movies = await sql<Movie[]>`
    SELECT 
    m.id, 
    m.title, 
    m.overview,  
    TO_CHAR(m.release_date, 'DD-MM-YYYY') AS release_date, 
    m.popularity,  
    ROUND(m.vote_average::numeric, 1) AS vote_average,  
    m.vote_count, 
    m.poster_path, 
    m.backdrop_path, 
    m.original_language,
    COALESCE(json_agg(g.name) FILTER (WHERE g.name IS NOT NULL), '[]') AS genres
    FROM movies m
    LEFT JOIN movie_genre mg ON m.id = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.id
    WHERE m.id >= 500
    GROUP BY m.id
    ORDER BY m.id 
    LIMIT 21;
    `
    return movies
  }

  static async getById (id: number): Promise<Movie | undefined> {
    const [movie] = await sql<[Movie?]>`
      SELECT 
        m.id, 
        m.title, 
        m.overview,  
        TO_CHAR(m.release_date, 'DD-MM-YYYY') AS release_date, 
        m.popularity,  
        ROUND(m.vote_average::numeric, 1) AS vote_average,  
        m.vote_count, 
        m.poster_path, 
        m.backdrop_path, 
        m.original_language,
        COALESCE(json_agg(g.name) FILTER (WHERE g.name IS NOT NULL), '[]') AS genres
      FROM movies m
      LEFT JOIN movie_genre mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE m.id = ${id}
      GROUP BY m.id
      ORDER BY m.id 
      LIMIT 21;

    `
    return movie
  }
}
