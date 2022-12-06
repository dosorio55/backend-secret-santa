import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { httpStatusCode } from "../../utils/seeds/httpStatusCode.js"


const getAllUsers = async (req, res, next) => {

  try {
    const users = await User.find().populate('contacts', 'name');
    return res.status(200).json(users);
  } catch (error) {
    return next(error)
  }
};

//--------------REGISTER USER
const registerUser = async (req, res, next) => {

  try {
    const { body } = req;

    const previousUser = await User.findOne({ email: body.email });

    if (previousUser) {
      const error = new Error('The user is already registered!');
      return next(error);
    }

    // Encriptar password
    const pwdHash = await bcrypt.hash(body.password, 10);

    // Crear usuario en DB
    const newUser = new User({
      name: body.name,
      surname: body.surname,
      email: body.email,
      password: pwdHash,
      account_type: body.account_type,
      applied_jobs: []
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      status: 201,
      message: httpStatusCode[201],
      data: {
        id: savedUser._id
      }
    });

  } catch (error) {
    return next(error);
  }
};

//--------------LOGIN USER 
const loginUser = async (req, res, next) => {

  try {
    const { body } = req;

    // Comprobar email
    const user = await User.findOne({ email: body.email });

    // Comprobar password
    const isValidPassword = await bcrypt.compare(body.password, user?.password ?? '');
    // Control de LOGIN
    if (!user || !isValidPassword) {
      const error = {
        status: 401,
        message: 'The email & password combination is incorrect!'
      };
      return next(error);
    }

    // TOKEN JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        rol: user.account_type
      },
      req.app.get("secretKey"),
      { expiresIn: "3h" }
    );

    return res.json({
      status: 200,
      message: httpStatusCode[200],
      data: {
        user: user._id,
        email: user.email,
        token: token,
        rol: user.account_type

      },

    });

  } catch (error) {
    return next(error);
  }
};

//----------------######LOGOUT
const logoutUser = async (req, res, next) => {

  try {
    req.authority = null;
    return res.json({
      status: 200,
      message: 'logged out',
      token: null
    })
  } catch (error) {
    next(error)
  }

};

//----------------------GET USER BY ID
const getUserById = async (req, res, next) => {

  const { id } = req.params;
  try {

    const userbyid = await User.findById(id)
      .select({ password: 0 });
    return res.status(200).json(userbyid);

  } catch (error) {
    return next(error)
  }
};
//----------------------GET USER CONTACTS

const getUserContacts = async (req, res, next) => {

  const { id } = req.authority;

  try {

    const userById = await User.findById(id).select({ contacts: 1, _id: 0 }).populate('contacts');

    const userContacts = userById.contacts.map((contact) => ({

      name: contact.name,
      surname: contact.surname,
      id: contact._id,
      image: contact.image

    }));
    return res.json({

      status: 200,

      message: httpStatusCode[200],

      data: { contacts: userContacts },

    });

  } catch (error) {

    return next(error)

  }

};


const getRecruiterJobs = async (req, res, next) => {

  const { id: user_id } = req.authority;

  try {
    const users = await User.findById(user_id).populate('created_jobs')

    const recruiterJobs = { createdJobs: users.created_jobs };

    return res.status(200).json(recruiterJobs);
  } catch (error) {
    return next(error)
  }
};


const getUserJobs = async (req, res, next) => {

  const { id: user_id } = req.authority;

  try {
    const users = await User.findById(user_id).populate('applied_jobs')

    const jobsList = users.applied_jobs.map(job => ({
      name: job.name,
      salary: job.salary,
      description: job.description,
      requirements: job.requiremets
    }));

    return res.status(200).json(jobsList);
  } catch (error) {
    return next(error)
  }
};

//-------------------------EDIT USER
const editUser = async (req, res, next) => {

  const userPhoto = req.file_url;// me traigo la url de la foto
  const bodyData = req.body;

  if (userPhoto) { bodyData.image = userPhoto }
  const { id: userId } = req.authority;

  try {
    const user = await User.findById(userId)
    const userModify = new User(bodyData);

    //Para evitar que se modifique el id de mongo:
    userModify._id = userId;
    userModify.contacts = user.contacts;
    // userModify.contacts = [...user.contacts]
    userModify.applied_jobs = user.applied_jobs;
    // userModify.applied_jobs = [...user.applied_jobs]
    //buscamos por el id y le pasamos los campos a modificar
    await User.findByIdAndUpdate(userId, userModify);

    //retornamos respuesta de  los datos del objeto creado 
    return res.json({
      status: 200,
      message: httpStatusCode[200],
      data: { user: userModify },
    });
  } catch (error) {
    return next(error);
  }
};

//----------------------------ADD A NEW CONTACT

const addNewContact = ('/', async (req, res, next) => {

  const { id: userId } = req.authority;
  const { contactId } = req.body;

  try {

    const user = await User.findById(userId).select({ contacts: 1, _id: 0 })
    const contact = await User.findById(contactId).select({ contacts: 1, _id: 0 })

    if (user.contacts.indexOf(contactId) !== -1 || contact.contacts.indexOf(userId) !== -1) {
      const error = new Error('the user you are trying to add is already in your contacts list');
      return next(error);
    }

    await User.updateOne(
      { _id: contactId },
      { $push: { contacts: userId } },
      { new: true }
    );

    await User.updateOne(
      { _id: userId },
      { $push: { contacts: contactId } },
      { new: true }
    );

    return res.status(200).json(`the contact ${contactId} was added correctly`);

  } catch (error) {
    next(error)
  }
});

const deleteContact = ('/', async (req, res, next) => {

  const { id: userId } = req.authority;
  const { contactId } = req.body;

  try {
    await User.findByIdAndUpdate(
      userId,
      { $pull: { contacts: contactId } }
    )
    await User.findByIdAndUpdate(
      contactId,
      { $pull: { contacts: userId } }
    )
    return res.status(200).json(`the contact ${contactId} was added deleted correctly`);

  } catch (error) {
    next(error)
  }
})

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDelete = await User.findByIdAndDelete(id);
    return res.json({
      status: 200,
      message: httpStatusCode[200],
      data: { user: userDelete },
    });
  } catch (error) {
    return next(error);
  }
};

export { getUserJobs, registerUser, getAllUsers, loginUser, logoutUser, getUserById, editUser, addNewContact, getUserContacts, deleteContact, deleteUser, getRecruiterJobs };