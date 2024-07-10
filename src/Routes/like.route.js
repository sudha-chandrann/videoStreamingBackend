import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ToogleLikeComment, ToogleLikeTweet, ToogleLikeVideo } from "../controllers/like.controller.js";
const router=Router()
router.use(verifyJWT)

router.route("/video/:videoId").get(ToogleLikeVideo)
router.route("/tweet/:tweetId").get(ToogleLikeTweet)
router.route("/comment/:CommentId").get(ToogleLikeComment)


export default router