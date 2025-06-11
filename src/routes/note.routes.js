import { Router } from "express";
import { createNote, editNote } from "../controllers/note.controllers.js";
import { jwtVerify } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/createNote").post(jwtVerify, createNote);
router.route("/editNote/:noteId").put(jwtVerify, editNote); 

export default router;