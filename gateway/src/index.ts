import express from 'express'
import { AuthRouter } from './routing/AuthRouter'
import { ProductsRouter } from './routing/ProductsRouter'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(express.json()) // Будем общаться JSON везде-везде
app.use(cookieParser())
app.use(cors({origin: process.env.EXPRESS_ACCESS_CONTROL_ALLOW_ORIGIN})) // Для прода так незя!

app.use('/auth', AuthRouter)
app.use('/products', ProductsRouter)

app.listen(8080)

console.log('App is up and listening on port', 8080)