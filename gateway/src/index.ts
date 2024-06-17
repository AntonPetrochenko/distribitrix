import express from 'express'
import { AuthRouter } from './routing/AuthRouter'
import { ProductsRouter } from './routing/ProductsRouter'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json()) // Будем общаться JSON везде-везде
app.use(cookieParser())

app.use('/auth', AuthRouter)
app.use('/products', ProductsRouter)

app.listen(8080)

console.log('App listening on port', 8080)