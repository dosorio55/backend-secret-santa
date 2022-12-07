import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    secretSanta: { type: mongoose.Types.ObjectId, ref: 'User', required: false },
    hasSanta: { type: Boolean, default: false },
    registered: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export { User }