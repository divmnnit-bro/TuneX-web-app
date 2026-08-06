import mongoose, {Schema} from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

export const Comments = new mongoose.model("Comments",commentSchema);