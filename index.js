const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const expressFile = require("express-fileupload");
const fileUpload = require("express-fileupload");
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  fileUpload({ useTempFiles: true, limit: { fileSize: 50 * 2024 * 1024 } })
);

app.use("/", require("./Routes/CreateUser"));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
