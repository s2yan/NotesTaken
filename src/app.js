import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({path: 'src/.env'})

const app = express()
app.use(cors({
    origin: '*',
    credentails: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) =>{
    res.send('Hello from Notes Taken server')
})

export { app }