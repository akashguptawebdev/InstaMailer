import express from "express";
import dotenv from "dotenv";
import SendEmailRoute from "./routes/emailSendRoute.js";
import connectDB from "./config/dbConnection.js";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Routes
app.use("/api/v1/email", SendEmailRoute);
// file preview Route
const uploadFolder = join(__dirname, 'utils', 'upload');
app.use('/preview/:filename', (req, res) => {
  const filePath = join(uploadFolder, req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: "File not found" });
    }
  });
});

app.get("/", (req , res)=>{
  res.status(200).json({
    message:"Home route",
    sucess:true
  })
})

connectDB();
app.listen(process.env.PORT , ()=>{
    console.log("server start on port " + process.env.PORT)
});