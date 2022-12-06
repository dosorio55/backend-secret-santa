import expres from "express";
import { isAuth } from "../../authentication/jwt.js";
import { getUserNotificationsById, notificationResolution, sendNotification } from "../controllers/notifications.controllers.js";

const notificationsRoutes = expres.Router();

notificationsRoutes.post("/sendNotification", [isAuth], sendNotification);
notificationsRoutes.post("/getNotifications", [isAuth], getUserNotificationsById);
notificationsRoutes.put("/updateNotifications", [isAuth], notificationResolution);

export { notificationsRoutes }
