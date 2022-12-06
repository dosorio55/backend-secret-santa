import expres from "express";
import { isAuth } from "../../authentication/jwt.js";

import { addMsg, getAllMsg } from "../controllers/messages.controllers.js";


const messagesRoutes = expres.Router();

messagesRoutes.post("/sendMessage", [isAuth], addMsg);
messagesRoutes.post("/getMessages", [isAuth], getAllMsg);

export { messagesRoutes }
