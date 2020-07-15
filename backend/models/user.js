const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6, trim: true },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
  bucketList: [
    {
      id: { type: mongoose.Types.ObjectId, required: true, ref: "Place" },
      _id: false,
      createdBy: { type: String },
      isVisited: { type: Boolean },
    },
  ],
});
// mongoose-unique-validator is a plugin which adds pre-save validation for unique fields within a Mongoose schema.
userSchema.plugin(uniqueValidator);
//Pre middleware functions are executed one after another, when each middleware calls next.
userSchema.pre("save", async function preSave(next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    user.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
