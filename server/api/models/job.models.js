import mongoose from "mongoose";

const Schema = mongoose.Schema;

const JobSchema = new Schema(
    {
        name: { type: String, required: true },
        recruiter_id: { type: mongoose.Types.ObjectId, ref: 'User', required: false },
        candidate_list: [{ type: mongoose.Types.ObjectId, ref: 'User', required: false }],
        salary: { type: Number, required: true },
        description: { type: String, required: true },
        location: { type: String, required: false },
        requiremets: { type: String, required: true },

    },
    {
        timestamps: true
    }
);

const Job = mongoose.model("Jobs", JobSchema);

export { Job };
