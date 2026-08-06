import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";

export const verifyJWT = asyncHandler( async (req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("bearer ","");

        if(!token)
            throw new ApiError(401,"Unauthorized Request , no Token provided");

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        //find the user as we have injected user in the token earlier
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user)
            throw new ApiError(404,"User not Found");

        //Attach the user object to the request 
        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401,"Invalid Access token");//expiry covered here
    }
});