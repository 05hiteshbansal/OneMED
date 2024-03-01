const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    issues:{
        type:Array,
    }
   
      
},{ timestamps: true }
);

module.exports = mongoose.model("temp_id", UserSchema);