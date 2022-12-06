import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    secretSanta: { type: String }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export { User }