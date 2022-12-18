import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { httpStatusCode } from "../../utils/seeds/httpStatusCode.js"
import { usersBlocked } from "../../utils/users.js";


const getAllUsers = async (req, res, next) => {

  try {
    const users = await User.find()
      .select({ name: 1, hasSanta: 1, _id: 0, secretSanta: 1, image: 1 })
    return res.status(200).json(users);
  } catch (error) {
    return next(error)
  }
};

const getAllUsersSantas = async (req, res, next) => {

  const { name } = req.authority;
  try {
    if (name !== 'Diego Alejandro') {
      return res.json({
        status: 401,
        message: httpStatusCode[401],
      });
    }
    const users = await User.find()
      .select({ name: 1, hasSanta: 1, _id: 0, secretSanta: 1 }).populate('secretSanta', 'name')
    return res.status(200).json(users);
  } catch (error) {
    return next(error)
  }
};

//--------------REGISTER CHANGE USER
const registerChangeUser = async (req, res, next) => {

  try {
    const { image, name, password } = req.body;

    const previousUser = await User.findOne({ name });

    if (!previousUser) {
      const error = new Error('This user is not registered to play');
      return next(error);
    } else if (previousUser.registered) {
      const error = new Error('The user is already registered!');
      return next(error);
    }

    const pwdHash = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(previousUser._id, { $set: { registered: true, password: pwdHash, image } })

    const token = jwt.sign(
      {
        id: previousUser._id,
        name: previousUser.name,
      },
      req.app.get("secretKey")
    );

    return res.json({
      status: 201,
      message: httpStatusCode[201],
      data: {
        id: updatedUser,
        token: token,
      },
    });

  } catch (error) {
    return next(error);
  }
};
//--------------Admin register USER
const registerUser = async (req, res, next) => {

  const { image, name, password } = req.body;
  try {
    if (req.authority.name !== 'Diego Alejandro') {
      const error = {
        status: 401,
        message: 'Not authorized'
      };
      return next(error);
    }

    const previousUser = await User.findOne({ name });

    if (previousUser) {
      const error = new Error('The user is already registered!');
      return next(error);
    }

    const pwdHash = await bcrypt.hash(password, 10);

    // Crear usuario en DB
    const newUser = new User({
      name,
      password: pwdHash,
      image
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      {
        id: savedUser._id,
        name: savedUser.name,
      },
      req.app.get("secretKey")
    );

    return res.json({
      status: 201,
      message: httpStatusCode[201],
      data: {
        id: savedUser._id,
        token: token,
      },
    });

  } catch (error) {
    return next(error);
  }
};

//--------------LOGIN USER 
const loginUser = async (req, res, next) => {

  try {
    const { name, password } = req.body;

    // Comprobar email
    const user = await User.findOne({ name });

    // Comprobar password
    const isValidPassword = await bcrypt.compare(password, user?.password ?? '');
    // Control de LOGIN
    if (!user || !isValidPassword) {
      const error = {
        status: 401,
        message: 'The name & password combination is incorrect!'
      };
      return next(error);
    }

    // TOKEN JWT
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      req.app.get("secretKey")
    );

    return res.json({
      status: 200,
      message: httpStatusCode[200],
      data: {
        id: user._id,
        name: user.name,
        token: token,
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

  const { id } = req.authority;

  try {

    const userbyid = await User.findById(id).populate('secretSanta', 'name')
      .select({ password: 0 });
    return res.status(200).json(userbyid);

  } catch (error) {
    return next(error)
  }
};

const createSecretSanta = async (req, res, next) => {

  const { id: userId } = req.authority;

  try {
    const userHasSanta = await User.findById(userId).select({ name: 1, secretSanta: 1 })

    if (userHasSanta.secretSanta) {
      return res.json({
        status: 409,
        message: 'Tu ya tienes un santa!',
      });
    }
    const users = await User.find().select({ name: 1, hasSanta: 1 })

    const notSantaUsers = users.filter((user) => !user.hasSanta && userHasSanta.name !== user.name);
    const userServerName = usersBlocked.find(user => userHasSanta.name === user.name)
    const getRandomNumber = (max) => Math.floor(Math.random() * max);

    let myRandomSanta;
    let santaCheck;
    while (!santaCheck) {
      myRandomSanta = notSantaUsers[getRandomNumber(notSantaUsers.length)]
      santaCheck = myRandomSanta.name !== userServerName.notAllowed
      debugger
      //Mariana != 
      if (userServerName.name === 'Dasha Kustova' && santaCheck) {
        santaCheck = myRandomSanta.name !== userServerName.notAllowed2
      } else if (userServerName.name === 'Dasha Kustova' && santaCheck) {
        santaCheck = myRandomSanta.name !== userServerName.notAllowed3
      }
    }

    await User.findByIdAndUpdate(myRandomSanta._id, { $set: { hasSanta: true } })
    await User.findByIdAndUpdate(userId, { $set: { secretSanta: myRandomSanta._id } })

    return res.json({
      status: 200,
      message: httpStatusCode[200],
      data: myRandomSanta,
    });
  } catch (error) {
    return next(error);
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

export { getUserJobs, getAllUsersSantas, createSecretSanta, registerUser, getAllUsers, loginUser, logoutUser, getUserById, editUser, addNewContact, getUserContacts, deleteContact, deleteUser, getRecruiterJobs, registerChangeUser };