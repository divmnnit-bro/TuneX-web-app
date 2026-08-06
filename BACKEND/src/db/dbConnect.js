import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
    } catch(err){
        console.log("MONGOdb CONNECTION FAILED!:",err);
        throw err;
    }
}

export default connectDB;