import express from 'express';
import { isAuth } from '../../authentication/jwt.js';
import { registerUser, loginUser, logoutUser, getUserById, getAllUsers, editUser, addNewContact, getUserContacts, deleteContact, deleteUser, getRecruiterJobs, getUserJobs, createSecretSanta, getAllUsersSantas, registerChangeUser } from '../controllers/user.controller.js';

// import { upload, uploadToCloudinary } from '../../middlewares/file.middleware.js'; */

const userRoutes = express.Router();

/* userRoutes.get('/contacts', [isAuth], getUserContacts);
userRoutes.get('/recruiterJobs', [isAuth], getRecruiterJobs);
userRoutes.get('/userJobs', [isAuth], getUserJobs);*/

userRoutes.get('/', getAllUsers);
userRoutes.get("/userById", [isAuth], getUserById);
userRoutes.get("/auth/santaInfo", [isAuth], getAllUsersSantas);
userRoutes.post('/getSanta', [isAuth], createSecretSanta)
userRoutes.post('/', [isAuth], registerUser);
userRoutes.post('/register', registerChangeUser);
userRoutes.post('/login', loginUser);
userRoutes.post('/logout', logoutUser);

/* userRoutes.put('/edit', [isAuth, upload.single('image'), uploadToCloudinary], editUser); */

/* userRoutes.put('/addContact', [isAuth], addNewContact);
userRoutes.put('/deleteContact', [isAuth], deleteContact);
userRoutes.delete('/:id', deleteUser); */

export { userRoutes };