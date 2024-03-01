const mongoose = require("mongoose");
const validator = require("validator");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneno: {
      type: String,
      required: true,
      minlength:[10,"Phone Number should be of 10 digits"]
    },
    clinic: {
      type: String,
      required: true,
    },
    speciaization: {
      type: String,
      required: true,
    },
    patientId:{
        type:mongoose.Schema.ObjectId,
        ref:'users',
        required:true
    }   
},{ timestamps: true }
);

module.exports = mongoose.model("doctors", UserSchema);
