import { Router } from 'express';
import { registerUser, loginUser, logoutUser, changePassword, changeAvatar, changeUserDetails, getUser, getUserNotes } from '../controllers/user.controllers.js';
import upload from '../middlewares/multer.middlewares.js'
import { jwtVerify } from "../middlewares/auth.middlewares.js";

const router = Router();
router.route('/register').post(upload.single("avatar"),registerUser);
router.route('/login').post(loginUser)

//secure routes
router.route("/logout").post(jwtVerify, logoutUser);
router.route("/changePassword").put(jwtVerify, changePassword);
router.route("/changeAvatar").put(jwtVerify, upload.single("avatar"), changeAvatar);
router.route("/changeUserDetails").put(jwtVerify, changeUserDetails);
router.route("/getUser").get(jwtVerify, getUser);
router.route("/getUserNotes").get(jwtVerify, getUserNotes);


export default router;