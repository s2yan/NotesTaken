import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config({path: './src/.env'})

const app = express()
app.use(cors({
    origin: '*',
    credentails: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());

app.get('/', (req, res) =>{
    res.send('Hello from Notes Taken server')
})

// Import routes
import userRouter from './routes/user.routes.js'
import noteRouter from './routes/note.routes.js'

app.use('/api/v1/user', userRouter)
app.use("/api/v1/note", noteRouter)

export { app }