import mongoose from "mongoose";

mongoose.connect(process.env.MongoDB_URL).then(()=>{
    console.log("Database Connected")
}).catch((error)=>{
    console.log("Error:Database not Connected")
})