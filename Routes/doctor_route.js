require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Doctor =require("../models/doctor")
const saltRounds = 10;

const uri = process.env.mongoURL;

mongoose
  .connect(uri)
  .then(console.log("connection successful"))
  .catch((err) => {
    console.log("some error in db connection");
    console.log(err);
  });




router.post("/doctorInfo", async (req, res) => {
  const {name , phoneno, clinic, speciaization } = req.body;
  const patientId=req.user._id
const doctorDetails =await Doctor.create({
    name , phoneno, clinic, speciaization,
    patientId
})  
});



/
module.exports = router;
