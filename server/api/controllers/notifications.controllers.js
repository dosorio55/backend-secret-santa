import { Notification } from "../models/notifications.models.js";

const sendNotification = async (req, res, next) => {

    const { to, type, jobId } = req.body;
    const { from } = req.authority;

    try {
        const newNotification = await Notification.create({

            jobId: jobId,
            type: type,
            to: to,
            from: from
        });

        if (newNotification) return res.json("Notification send succesfully.")
        return res.json({ msg: "Failed to add send notification." })
    } catch (error) {
        return next(error);
    }

}

const getUserNotificationsById = async (req, res, next) => {

    const { id: to } = req.authority;

    try {
        const notifications = await Notification.find({ to: to })
            .populate('from', ['name', 'surname', 'image', 'email'])
            .populate('jobId', 'name')
            .sort({ updatedAt: -1 })

        return res.json(notifications)
    } catch (error) {
        return next(error);
    }
};

const notificationResolution = async (req, res, next) => {

    const { id: userId } = req.authority;
    const { type, to: toId, jobId, notificationId } = req.body;

    try {

        await Notification.findByIdAndUpdate(notificationId, { view_status: type })

        let newNotification;
        if (type === "Reject") {
            newNotification = await Notification.create({
                from: userId,
                to: toId,
                view_status: "Reject",
                jobId: jobId,
                type: "rejected"
            });

        } else {
            newNotification = await Notification.create({
                from: userId,
                to: toId,
                view_status: "Accept",
                jobId: jobId,
                type: "accepted"
            });
        }
        if (!newNotification) {
            const error = new Error('error creating the notification');
            return next(error);
        };

        return res.status(200).json(newNotification);
    } catch (error) {
        return next(error);
    }
}

export { sendNotification, getUserNotificationsById, notificationResolution }
