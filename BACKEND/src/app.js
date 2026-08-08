import express from 'express';
const app = express();
import CORS from 'cors';
import cookieParser from 'cookie-parser';

const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());

app.use(CORS({
    origin: function (origin, callback) {
        // allow requests with no origin (like Postman, curl, or server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({
    limit: "1mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "1mb"
}));

app.use(express.static('public'));

app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import agentRouter from "./routes/agent.routes.js";
import authRoutes from './routes/auth.js';


app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/agent", agentRouter);
app.use('/api/auth', authRoutes);

export { app };
