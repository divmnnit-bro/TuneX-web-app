import express from 'express';
const app = express();
import CORS from 'cors';
import cookieParser from 'cookie-parser';
app.use(CORS({
    // allowing the frontend to access the backend, we need to set the origin to the frontend url
     // allowing the frontend to send cookies to the backend, we need to set the credentials to true
    origin: https://tune-x-web-app.vercel.app,
    credentials:true
}));

// letting the backend to accept json data from the frontend, we need to set the json middleware
app.use(express.json({
    limit: "1mb"
}));

// letting the backend to accept url encoded data from the frontend, we need to set the urlencoded middleware
app.use(express.urlencoded({
    extended: true,
    limit: "1mb"
}));

//public folder is used to serve static files like images, css, js etc. so we need to set the public folder as static
app.use(express.static('public'));

// parsing the cookies data (headers) into req.cookies object
app.use(cookieParser());



// routes import!
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import agentRouter from "./routes/agent.routes.js";
import authRoutes from './routes/auth.js';
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/agent", agentRouter);
app.use('/api/auth', authRoutes);


export  { app };