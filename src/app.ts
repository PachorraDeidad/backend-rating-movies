import express from 'express'
import routes from './routes'
import { port } from './config/env.config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { tokenMiddleware } from './middlewares/token'
import { corsOptions } from './middlewares/cors'

const app = express()

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(tokenMiddleware)

app.disable('x-powered-by')

app.use('/', routes)

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

app.get('/protected', async (req, res): Promise<void> => {
  const { user } = req.session
  if (user === null) {
    res.status(403).send('Access not authorized')
  } else {
    res.status(200).send('<h1>wwww</h1>')
  }
})
