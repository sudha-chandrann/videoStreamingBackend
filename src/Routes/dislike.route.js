import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ToogledislikeComment, ToogleDislikeTweet, ToogleDislikeVideo } from "../controllers/dislike.controller.js";
const router=Router()
router.use(verifyJWT)

router.route("/video/:videoId").get(ToogleDislikeVideo)
router.route("/tweet/:tweetId").get(ToogleDislikeTweet)
router.route("/comment/:CommentId").get(ToogledislikeComment)

export default router