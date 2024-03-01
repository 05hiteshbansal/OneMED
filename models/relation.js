const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema(
  {
    relationname: {
      type: String,
      required: true,
    },
    fromuser_id:{
        type:mongoose.Schema.ObjectId,
        ref:'users',
        required:true
    }  ,
    touser_id:{
        type:mongoose.Schema.ObjectId,
        ref:'users',
        required:true
    }  ,
      
},{ timestamps: true }
);

module.exports = mongoose.model("relation", UserSchema);
