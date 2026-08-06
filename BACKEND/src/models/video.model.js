import mongoose , { Schema } from 'mongoose';

const videoSchema = new Schema(
    {
        videoFile:{
            type:String,//cloudinary url to store the video file
            required:true,
        },
        thumbnail:{
            type:String,//cloudinary url to store the thumbnail image
            required:true,
        },
        title:{
            type:String,
            required:true,
            trim:true, // removes whitespace from both ends of a string
        },
        description:{
            type:String,
            required:true,
            trim:true, // removes whitespace from both ends of a string
        },
        duration:{
            type:Number, // we will get the duration from cloudinary
            required:true,
        },
        views:{
            type:Number,
            default:0
        },
        likesCount: {          // ← add this
            type: Number,
            default: 0
        },
        isPublished:{
            type:Boolean,//public or private video
            default:true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    },{timestamps:true}
);

export const Video = mongoose.model("Video",videoSchema);
