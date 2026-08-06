import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);


import 'dotenv/config';
console.log("Loaded URI:", process.env.MONGODB_URI);
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/dbConnect.js";
import express from "express";

import { app } from "./app.js";
// Every Async Function return a Promise, so we can use .then() and .catch() to handle response and errors
// Connecting MongoDB using the imported connectDB function from dbConnect.js file



connectDB()
.then(() => {
    console.log("Connected to MongoDB");
    const server = app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });

    server.requestTimeout = 0;       // disable the 5-minute hard cutoff entirely
    server.headersTimeout = 120000;  // 2 minutes instead of the default 60 seconds
    server.keepAliveTimeout = 120000;
    
    server.on("error", (err) => {
        console.error("Server error:", err);
    });
})
.catch((err) => {
    console.log("MongoDB Connection Error:", err);
});

/*( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
        app.on("error",(err)=>{
            console.log("ERROR:",err);
            throw err;
        })
        // database connect hogya bhai , now lets start the server!!

        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
        
        // agar database connect nhi hua to, catch and display error!
    } catch(err){
        console.log("ERROR:",err);
    }

})();*/