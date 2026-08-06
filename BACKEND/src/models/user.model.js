import mongoose , { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true, // removes whitespace from both ends of a string
        index:true // makes searching faster
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true, // removes whitespace from both ends of a string
    },
    fullname:{
        type:String,
        required:true,
        trim:true, // removes whitespace from both ends of a string
        index:true // makes searching faster
    },
    avatar:{
        type:String, // we will use cloudinary url to store the avatar image
    },
    coverImage:{ // Channel Banner
        type:String,
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required: [true, "Password is required"],
    },
    refreshToken:{
        type:String,
    },
     resetPasswordToken: {
        type: String,
    },
    resetPasswordExpiry: {
        type: Date,
    }
    },{timestamps:true}
);

//using pre-save hook to hash the password before saving it to the database
//In modern Mongoose, if you return a Promise (which an async function does automatically),
// Mongoose waits for that promise to resolve before saving.
//By using return; instead of return next();, it stops executing and 
// resolves immediately if the password hasn't changed.
userSchema.pre("save",async function() { // no need of function(next    ), it will handle itself
    
    if(!this.isModified("password")) return ;

    this.password = await bcrypt.hash(this.password, 10);
   // next();
});

// lets design custom method
userSchema.methods.isPasswordCorrect = async function(password) {
     return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken =  function() {
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}



export const User = mongoose.model("User", userSchema);