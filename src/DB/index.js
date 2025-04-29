import mongoose from 'mongoose';

const DB_name = process.env.DB_NAME

const connectDB = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/${DB_name}`)

        console.log(`Database connected succesfully: ${connectionInstance.connection.host}`)
    }catch(err){
        console.log(`Error connecting to database ${err}`)
        process.exit(1)
    }
}

export { connectDB}