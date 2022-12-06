import express from "express";
import 'dotenv/config';
import { Server, Socket } from "socket.io"

import { connection } from "./server/config/database.js"
import cors from "cors";

//ROUTES
import { userRoutes } from "./server/api/routes/user.routes.js";
import { messagesRoutes } from "./server/api/routes/messages.routes.js";
import { jobRoutes } from "./server/api/routes/jobs.routes.js";
import { notificationsRoutes } from "./server/api/routes/notifications.routes.js";

connection();

const PORT = process.env.PORT;
const router = express.Router();
const server = express();

server.set("secretKey", "nodeRestApi");

//headers setups
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


//Midlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
//CORS
server.use(cors("*"));

//ROUTES
router.get('/', (req, res) => {
    res.send('Server running OK')
});

server.use('/', router);
server.use("/users", userRoutes);
server.use("/messages", messagesRoutes);
server.use("/notifications", notificationsRoutes);
server.use("/jobs", jobRoutes);

//ERROR CONTROL
server.use('*', (req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
});

server.use((err, req, res, next) => {
    return res.status(err.status || 500).json(err.message || 'Unexpected error');
});

//SERVER LISTEN

const serverListen = server.listen(PORT, () => {
    console.log(`Node server listening on port http:${PORT}`)
});

const io = new Server(serverListen, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
    // console.log(socket.id);
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (msg, from) => {
        // console.log(from, msg.message);
        const sendUserSocket = onlineUsers.get(msg.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", msg.message, from);
        }
    });
});

/* const io = new Server(serverListen, {
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on('connection', (socket) => {
    console.log(socket.id)
    socket.on('send-message', (message) => {
        console.log(message);
        io.emit('receive-message', message)
        socket.to(room).emit("receive-message", message)
    })
    socket.on("join-room", room => {
        console.log('está en el room');
        socket.join(room)
    })
    
}); */
