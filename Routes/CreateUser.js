require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const expressFile = require("express-fileupload");
const user = require("../models/User");

const saltRounds = 10;

const uri = process.env.mongoURL;

// email config
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASSWORD,
//   },
// });

mongoose
  .connect(uri)
  .then(console.log("connection successful"))
  .catch((err) => {
    console.log("some error in db connection");
    console.log(err);
  });

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

async function findUser(query) {
  try {
    const userFound = await user.findOne(query);
    return userFound;
  } catch (err) {
    console.log("Something went wrong trying to find the documents:" + err);
  }
}

async function insertUser(newUser) {
  try {
    await user.create(newUser);
    console.log("documents successfully inserted.");
  } catch (err) {
    console.log("Error while inserting" + err);
  }
}

async function updateUser(filter, update) {
  try {
    await user.findOneAndUpdate(filter, update);
    console.log("documents successfully inserted.");
  } catch (err) {
    console.log("Error while inserting" + err);
  }
}

async function changePassword(query, password) {
  let updatedUser = await user.updateOne(query, {
    $set: { password: password },
  });

  if (updatedUser) {
    return true;
  } else {
    return false;
  }
}

async function updateImg(query, pic) {
  let updatedUser = await user.findOneAndUpdate(
    query,
    {
      $set: { imgUrl: pic },
    },
    {
      new: true,
    }
  );

  if (updatedUser) {
    return updatedUser;
  } else {
    return false;
  }
}

async function generateAuthToken(id) {
  try {
    const token = await jwt.sign(
      {
        _id: id,
      },
      process.env.HASH_KEY
    );
    return token;
  } catch (error) {
    console.log(error);
  }
}

router.post("/signup", async (req, res) => {
  var encryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
  const newUser = new user({
    name: req.body.name,
    password: encryptedPassword,
    email: req.body.email,
    location: req.body.location,
  });

  const token = await generateAuthToken(newUser.__vid);
  const query = { email: req.body.email };

  const duplicateUser = await findUser(query);

  if (duplicateUser !== null) {
    res.send({ Success: false, msg: "Already registered" });
  } else {
    const userSave = {
      name: req.body.name,
      password: encryptedPassword,
      email: req.body.email,
      location: req.body.location,
    };

    await insertUser(userSave);
    res.send({ Success: true, msg: "Successfully registered" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const findQuery = { email: email };
  const emailFind = await findUser(findQuery);

  if (emailFind) {
    var checkEncryptedPassword = await bcrypt.compare(
      password,
      emailFind.password
    );
    if (checkEncryptedPassword == true) {
      res.json({ Success: true, user: emailFind });
    } else {
      res.json({ Success: false, msg: "Passwords do not match" });
    }
  } else {
    res.json({ Success: false, msg: "You hav not registered yet" });
  }
});

router.post("/pdfSubmit/:id", async (req, res) => {
  const { id } = req.params;
  const foundUser = await user.findById(id);
  console.log(foundUser.pdf);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  const file = req.files.image;
  const title = req.body.title;
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "images",
  });

  const pdfArray = foundUser.pdf;
  const pdfObject = {
    title: title,
    url: result.url,
  };
  pdfArray.push(pdfObject);
  let filter = { email: foundUser.email };
  let update = { pdf: pdfArray };
  console.log(pdfArray);
  await updateUser(filter, update);
  return res.json({ msg: "Pdf submitted" });
});

// router.post("/user/sendotp", async (req, res) => {
//   const query = { email: req.body.email };
//   const emailFind = await findUser(query);

//   const UserFound = await findUser(query);
//   if (UserFound) {
//     const OTP = Math.floor(100000 + Math.random() * 900000);
//     const existEmail = await userotp.findOne({ email: req.body.email });

//     if (existEmail) {
//       const updateData = await userotp.updateOne(
//         { email: req.body.email },
//         { $set: { otp: OTP } },
//         { new: true }
//       );
//       const mailOptions = {
//         from: process.env.EMAIL,
//         to: req.body.email,
//         subject: "Sending EMAIL for OTP Validation",
//         text: `OTP: ${OTP}`,
//       };
//       await transporter.sendMail(mailOptions, (err, info) => {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Email Sent");
//         }
//       });
//       res.send({
//         Success: true,
//         user: emailFind,
//         AuthToken: emailFind.tokens.token,
//         otp: OTP,
//       });
//     } else {
//       const saveOtpData = new userotp({
//         email: req.body.email,
//         otp: OTP,
//       });
//       await saveOtpData.save();
//       const mailOptions = {
//         from: process.env.EMAIL,
//         to: req.body.email,
//         subject: "Sending EMAIL for OTP Validation",
//         text: `OTP: ${OTP}`,
//       };
//       await transporter.sendMail(mailOptions, (err, info) => {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Email Sent");
//         }
//       });
//       res.send({
//         Success: true,
//         user: emailFind,
//         AuthToken: emailFind.tokens.token,
//         otp: OTP,
//       });
//     }
//   } else {
//     res.send({ Success: false });
//   }
// });

// router.post("/api/create-checkout-session", async (req, res) => {
//   const { data } = req.body;

//   const lineItems = data.map((product) => ({
//     price_data: {
//       currency: "inr",
//       product_data: {
//         name: product.name,
//       },
//       unit_amount: (product.price / product.qtyOrdered) * 100,
//     },
//     quantity: product.qtyOrdered,
//   }));

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: lineItems,
//     mode: "payment",
//     success_url: "http://localhost:5173/success",
//     cancel_url: "http://localhost:5173/cancel",
//   });

//   res.send({ Success: "true", sessionId: session.id });
// });

// router.post("/changePassword", async (req, res) => {
//   const findQuery = { email: req.body.email };
//   const FoundEmail = await findUserOrder(findQuery);

//   var checkEncryptedPassword = await bcrypt.compare(
//     req.body.password,
//     FoundEmail.password
//   );

//   if (checkEncryptedPassword === true) {
//     var encryptedPassword = await bcrypt.hash(req.body.newPassword, saltRounds);
//     const updatedEmail = await changePassword(findQuery, encryptedPassword);
//     if (updatedEmail) {
//       res.send({ Success: true });
//     } else {
//       res.send({ Success: false });
//     }
//   } else {
//     res.send({ Success: false });
//   }
// });

// router.post("/uploadImage", async (req, res) => {
//   const findQuery = { email: req.body.email };
//   const FoundEmail = await updateImg(findQuery, req.body.pic);
//   if (FoundEmail) {
//     res.send({ Success: true, picUrl: FoundEmail.imgUrl, user: FoundEmail });
//   } else {
//     res.send({ Success: false });
//   }
// });

module.exports = router;
