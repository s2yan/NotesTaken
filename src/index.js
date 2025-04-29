import { app } from './app.js';
import { connectDB } from './DB/index.js';

const PORT = process.env.PORT || 9000

connectDB()
.then(() =>{
    app.listen(PORT, () =>{
        console.log(`Server is listening on port ${PORT}`)
    })
}) 
.catch(
    (err) => {
        console.log(`Error connecting to server: ${err}`)
    }
)
