import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getlikesvideos, ToogleLikeComment, ToogleLikeTweet, ToogleLikeVideo } from "../controllers/like.controller.js";
const router=Router()
router.use(verifyJWT)

router.route("/video/:videoId").get(ToogleLikeVideo)
router.route("/tweet/:tweetId").get(ToogleLikeTweet)
router.route("/comment/:CommentId").get(ToogleLikeComment)
router.route("/likedvideos").get(getlikesvideos)

export default router