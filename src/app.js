import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app= express()
app.use(cors(
   {
     origin:process.env.CORS_ORIGIN,
     credentials:true
    }
))
app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))
app.use(cookieParser())

import UserRouter from "./Routes/user.route.js"
import VideoRouter from "./Routes/video.route.js"
import TweetRouter from "./Routes/tweet.route.js"
import likeRouter from "./Routes/like.route.js"
import dislikeRouter from "./Routes/dislike.route.js"
import commentRouter from "./Routes/comment.route.js"
import subscriptionRouter from "./Routes/subscription.route.js"
import playlistRouter from "./Routes/playlist.route.js"
app.use("/api/v1/users",UserRouter)
app.use("/api/v1/videos",VideoRouter)
app.use("/api/v1/tweets",TweetRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/dislikes",dislikeRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/playlists",playlistRouter)

export {app}