const mongoose= require('mongoose');
const {env}=require('../config/env.js');
const connectDB= async()=>{
    try {
         const connectionInstance=await mongoose.connect(env.MONGO_URI)
         console.log(`\n MongoDB is connected !! DB Host :${connectionInstance}`);
        
    } catch (error) {
        console.log("MongoDB connection error",error);
        process.exit(1);
        
    }
}
module.exports = connectDB;