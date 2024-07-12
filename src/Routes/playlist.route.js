import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const router=Router()
router.use(verifyJWT)

router.route("/post").post(upload.none(),createPlaylist)
router.route("/:playlistId/:videoId").patch(addVideoToPlaylist)
router.route("/:playlistId/:videoId").get(removeVideoFromPlaylist)
router.route("/:playlistId").delete(deletePlaylist)
router.route("/:playlistId").patch(upload.none(),updatePlaylist)
router.route("/:playlistId").get(getPlaylistById)
router.route("/user/:userId/user").get(getUserPlaylists)
export default router