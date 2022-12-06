import { Job } from "../models/job.models.js";
import { httpStatusCode } from "../../utils/seeds/httpStatusCode.js"
import { User } from "../models/user.model.js";
import { Notification } from "../models/notifications.models.js";


const getAllJobs = async (req, res, next) => {

    try {
        const jobs = await Job.find().populate('recruiter_id', ['name', 'surname'])
        return res.status(200).json(jobs);
        // return res.json({
        //     status: 200,
        //     message: httpStatusCode[200],
        //     data: { jobs: jobs },
        // });
        // res.send(jobs);
    } catch (error) {
        return next(error)
    }
};


const getJobById = async (req, res, next) => {

    try {

        const { id } = req.params;

        const jobById = await Job.findById(id);
        return res.status(200).json(jobById);
        // return res.json({
        //     status: 200,
        //     message: httpStatusCode[200],
        //     data: { jobs: jobbyid },
        // });
        //res.send(jobbyid);
    } catch (error) {
        return next(error)
    }
};

const getJobByRecruiter = async (req, res, next) => {

    try {
        const { id } = req.authority;
        const jobByRecrutier = await Job.find({ recruiter_id: id });

        return res.status(200).json(jobByRecrutier);
        // return res.json({
        //     status: 200,
        //     message: httpStatusCode[200],
        //     data: { jobs: jobbyid },
        // });
    } catch (error) {
        return next(error)
    }
};

//----------------------------CREATE JOB
const createJob = async (req, res, next) => {

    const { body } = req;
    const { id: userId, rol } = req.authority

    try {

        if (rol !== "Recruiter") {
            const error = {
                status: 401,
                message: 'You are not a recruiter, you cannot create jobs'
            };
            return next(error);
        };

        const newJob = new Job({
            name: body.name,
            recruiter_id: userId,
            salary: body.salary,
            description: body.description,
            requiremets: body.requiremets,
        });

        const savedJob = await newJob.save();

        await User.findByIdAndUpdate(userId, { $push: { created_jobs: savedJob._id } })

        return res.json({
            status: 201,
            message: 'Job Registered successfully',
            data: savedJob
        });

    } catch (error) {
        return next(error);

    }
};

//FUNCION PARA VINCULAR USUARIO A OFERTA DE TRABAJO- EN PRUEBAS-- OSCAR
const addUserToJob = async (req, res, next) => {

    try {
        const { _id: jobId } = req.body;
        const { id: userId } = req.authority;

        const findJob = await Job.findById(jobId);
        const findUser = await User.findById(userId);

        //controlar que no se pueda agregar el mismo usuario o trabajo dos veces
        if (findJob.candidate_list.indexOf(userId) !== -1 || findUser.applied_jobs.indexOf(jobId) !== -1) {
            const error = new Error('this user already applied to this job');
            return next(error);
        }

        const newNotification = await Notification.create({
            from: userId,
            to: findJob.recruiter_id,
            view_status: "not seen",
            jobId: jobId,
            type: "job_application"
        });

        if (!newNotification) {
            const error = new Error('error creating the notification');
            return next(error);
        };

        await User.updateOne(
            { _id: userId },
            { $push: { applied_jobs: jobId } },
            { new: true }
        );

        await Job.updateOne(
            { _id: jobId },
            { $push: { candidate_list: userId } },
            { new: true }
        );
        return res.status(200).json(findJob);
    } catch (error) {
        return next(error);
    }
}

const deleteUserFromJob = async (req, res, next) => {

    try {
        const { _id: jobId } = req.body;
        const { id: userId } = req.authority;

        await User.updateOne(
            { _id: userId },
            { $pull: { applied_jobs: jobId } }
        );

        const deleteUserFromJob = await Job.findByIdAndUpdate(
            jobId,
            { $pull: { candidate_list: userId } }
        );
        return res.status(200).json(deleteUserFromJob);
    } catch (error) {
        return next(error);
    }
}

//funcion para eliminar subscripciond e usuario, En pruebas. Oscar
//   const deleteUserFromJob = async (req, res, next) => {

//     try {       
//     const { _id } = req.body;  
//     const { userId } = req.body;
//     //console.log(_id,userId,5);
//     const updatedJob = await Job.findByIdAndUpdate(
//         _id ,
//           { $push: { candidate_list: userId } },
//           { new: true }
//       );
//       return res.status(200).json(updatedJob);
//   } catch (error) {
//       return next(error);
//   }
//   }

// const findJobByName = async (req, res, next) => {
//     const { name } = req.params;
//     console.log(name);
//     try {
//         const companieByName = await Companies.find({ name: name });
//         return res.json({
//             // status: 200,
//             // message: httpStatusCode[200],
//             data: { companie: companieByName }
//         })
//     } catch (error) {
//         next(error)
//     }
// };

// const editNamejob = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const NameJob = new Companies(req.body);
//         //Para evitar que se modifique el id de mongo:
//         Companies._id = id;
//         const NameJobUpdate = await Companies.findByIdAndUpdate(
//             id,
//             NameJob
//         );
//         return res.json({
//             status: 200,
//             message: httpStatusCode[200],
//             data: { namejob: NameJobUpdate },
//         });
//     } catch (error) {
//         return next(error);
//     }
// };


export { getAllJobs, getJobByRecruiter, getJobById, createJob, addUserToJob, deleteUserFromJob };