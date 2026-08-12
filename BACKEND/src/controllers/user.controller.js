import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import jwt from "jsonwebtoken";
import { app } from "../app.js";
import { Video } from "../models/video.model.js";
import { Likes } from "../models/likes.model.js";
import { Comments } from "../models/comments.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import crypto from "crypto";

const GenerateAccessAndRefreshToken = async(Userid) =>{
    try {
        const user = await User.findById(Userid);
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // save refresh token in db
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});//or else you'all have to send full stuff to validate

        return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens");
    }
}

const registerUser = asyncHandler( async (req,res) => {
    
        const {fullname,email,username,password} = req.body;
        if(fullname==="" || username==="" || email==="" || password==="")
            throw new ApiError(400,"All Fields are Required");

        console.log(req.body);
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if(!usernameRegex.test(username))
            throw new ApiError(400,"Username can only contain letters and numbers");

        // email: must be a gmail.com address
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if(!gmailRegex.test(email))
            throw new ApiError(400,"Email must be a valid @gmail.com address");
        // Now checking whether user of the given data pre-Exists?
        // if condiition is false.. still find() returns empty array which is truthy , hence we use findOne!
        const existedUser = await User.findOne({
            $or:[{ username } , { email } ]
        })

        if(existedUser) 
            throw new ApiError(409, "User Already Exist");

        // multer middleware is injected , it adds req.files method to check incoming files from frontend
        // fetching localPath through multer (server par file hai)
        const avatarLocalPath =  req.files?.avatar[0]?.path;
        let coverImageLocalPath="";
           if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
            coverImageLocalPath = req.files.coverImage[0].path;
        else 
            coverImageLocalPath="";

        // does avatar file arrived?
        if(!avatarLocalPath)
            throw new ApiError(400,"Avatar File is Required");


        // Now,lets upload avatar on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        let coverimage="";
        if(coverImageLocalPath)
            coverimage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar)//optional not req (try removing this)
            throw new ApiError(400,"Avatar File is Required");


        const user = await User.create(
            {
                fullname,
                avatar:avatar.url,
                coverImage:coverimage?.url || "",
                email,
                password,
                username:username.toLowerCase()

            }
        );

        // now lets check whether user is successfully made entry into the database
        // MongoDB khudse ._id banata hai for every entry!
        // now send this user created freshly to the frontend without password and refresh token coz no need
        const userCreated = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        if(!userCreated)
            throw new ApiError(500,"Something went wrong while Registering the User");

        return res.status(201).json(
            new ApiResponse(200,userCreated,"User Registered successfully")
        );
});

const loginUser = asyncHandler( async (req,res) => {
    const {email, username, password} = req.body;
    if(!username && !email)
        throw new ApiError(400,"Username or Email is required");

    // ya to email ya to password ki help se user ko dhundo!
    const user = await User.findOne({
        $or: [{email} , {username}]
    });
    
    if(!user)
        throw new ApiError(404,"User not Found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid)
        throw new ApiError(401,"Invalid Password");

    const {accessToken,refreshToken} = await GenerateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id);

    //sending cookie
   const accessTokenOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day — match your ACCESS_TOKEN_EXPIRES_IN
    };

    const refreshTokenOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days — match your REFRESH_TOKEN_EXPIRES_IN
    };

    return res.status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Logged In Successfully")
    );
})

const logOutUser = asyncHandler( async (req,res) => {
    // find the user and delete their refresh token from the database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    );

    // now clear the cookies on the client browser
   const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",     
};

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{}," Logged Out Successfully")
    );
});

const refreshaccessToken = asyncHandler( async (req,res) => {
    const IncomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!IncomingRefreshToken)
        throw new ApiError(401,"Unauthorized Request");

    const decodedToken = jwt.verify(IncomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    if(!decodedToken)
        throw new ApiError(401,"Invalid Refresh Token");

    const user = await User.findById(decodedToken._id);
    if(!user)
        throw new ApiError(401,"Invalid Token.. False Request");

    // now we check if refresh token is expired or not.. if yes,login again!
    if(IncomingRefreshToken!=user.refreshToken)
        throw new ApiError(401,"Refresh Token is Expired or Used");

    // if not, then we have to generate new access token to keep alive the login session
    
    const {accessToken,refreshToken:newRefreshToken} = await GenerateAccessAndRefreshToken(user._id);

   const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",      
};

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "access Token Refreshed"
        )
    )
})

const updatePassword = asyncHandler( async (req,res) => {
    const {oldPassword , newPassword} = req.body;
    
    const user = await User.findById(req.user?._id);

    const ispasswordCorrect = user.isPasswordCorrect(oldPassword);
    if(!ispasswordCorrect)
        throw new ApiError(400,"Invalid old Password");

    user.password = newPassword;
    user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password changed!")
    );
});

const forgotPassword = asyncHandler ( async ( req,res) => {
    const { email } = req.body;
    if(!email?.trim())
        throw new ApiError(400,"Email is Required");
    
    const user = await User.findOne({email: email});
    if(!user)
        throw new ApiError(404,"User Not Found");

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");;
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${rawToken}`;
    
})
const getCurrentUser = asyncHandler( async (req,res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"")
    );
}); 

const updateAccountdetails = asyncHandler( async (req,res) => {
    const {fullname} = req.body;

    if(!fullname)
        throw new ApiError(400,"Fullname is required");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname:fullname
            }
        },
        {
            new:true
        }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,{user},"Account details updated successfully")
    );
});

const updateUserAvatar = asyncHandler( async (req,res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath)
        throw new ApiError(400,"AVATAR FILE NOT FOUND");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
      
    if(!avatar.url)
        throw new ApiError(400,"FAILED TO UPLOAD AVATAR");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
      ).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(200,user,"AVATAR UPDATED")
      );
});

const updateUserCoverImage = asyncHandler( async (req,res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath)
        throw new ApiError(400,"FILE MISSING");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url)
        throw new ApiError(400,"FAILED TO UPLOAD FILE");

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"COVER IMAGE UPDATED!")
    );
});

const getUserchannelProfile = asyncHandler( async (req,res) => {
    const { username } = req.params;
    if(!username)
        throw new ApiError(400,"USERNAME IS MISSING!");

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        { // subscription schema me Subscription stored as subscriptions
            $lookup: { // subscribers
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }// now i have 2 fields subs and subTo.. now lets add it temporarily in our User
        }, // its not added in the user database... its stored in the copy of the user when we apply addfields
        {
            $addFields: {
                subscribersCount: {
                    $size : "$subscribers" // subscribers field ka size batao
                },
                channelsSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed: { // kya maine is channel ko subsribe kiya hai ??
                    $cond : {
                        if: {$in: [req.user?._id , "$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }// $subscribers me wo sare subscription schemas hai jinhone username ko subscriber kiya hai
                    // unhi me se check karlo, agar req.user ki id "subscriber" wali field me hai?
                }
            }
        },
        {
            $project:{ // jo-jo values pass karni hai
                fullname:1,
                username:1,
                email:1,
                avatar:1,
                subscribersCount:1,
                isSubscribed:1,
                channelsSubscribedToCount:1,
                coverImage:1
            }
        }
    ]);

    if(!channel?.length)
        throw new ApiError(404,"CHANNEL DOES NOT EXIST");

    // aggregate returns like this -> const channel = [ { username: "divyank", subscribersCount: 500 } ];
    return res.
    status(200)
    .json(
        new ApiResponse(200,channel[0],"USER CHANNEL FETCHED SUCCESSFULLY")//hence channel[0] is required!
    );
});

const getWatchHistory = asyncHandler( async (req,res) => {
    const userid = req.user?._id;
    // userid is always the string... mongoose converts it internally to ObjectId(userid);
    const userwatchHistory = await User.aggregate([
        // find the logged in user
        { 
            $match:{
                _id: new mongoose.Types.ObjectId(userid) // mongoose automatically adds ObjectId(id) but here inside the pipeline..mongoose wont work
            }
        },
        // watchHistory array contains only video ids
        // replace the video ids with the actual objects containing useful info like thumbnail wagerah and owner
        {
            $lookup:{ // iterate through the wHis array,and replace them with the video objects!(copy array ofc)
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                //we are standing on a video.. now,for each video,find the details of the video
                pipeline:[
                    {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project:{//  you ae standing on a owner .. only take necessary info
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },
                    // now you are standing on a user(owner)
                    {
                        // lookup returns an array,so we would have got like this..
                        // watchHistory:[{fullname:... , username:... , owner:[{}]}]
                        // so in frontend u will have to do like this ..
                        // video.owner[0].fullname => bar bar [0]
                        // flatten owner into a single object!
                        // first element of owner!..mongoose dont understand owner[0]
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    if(!userwatchHistory?.length)
        throw new ApiError(404,"USER DOESNT EXIST OR NOT VIDEOS WATCHED YET");

    return res
    .status(200)
    .json(
        new ApiResponse(200,userwatchHistory[0].watchHistory,"USER WATCH HISTORY FETCHED SUCCESSFULLY!")
    );
});

export {registerUser,loginUser,logOutUser,refreshaccessToken,updatePassword,getCurrentUser,updateAccountdetails,updateUserAvatar,updateUserCoverImage,getUserchannelProfile,getWatchHistory};  
