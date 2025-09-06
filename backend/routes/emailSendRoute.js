import express from "express";
import { createEmailTemplate, editEmailTemplate, getEmailTemplate, sendEmailWithTemplate, testSendEmail } from "../controller/userSendMailController.js";
import { upload } from "../utils/setupMulter.js";

const SendEmailRoute = express.Router();


SendEmailRoute.post("/send" ,testSendEmail );
SendEmailRoute.get("/getEmailTemplate" ,getEmailTemplate );
SendEmailRoute.post("/sendEmailByTemplate" ,sendEmailWithTemplate )
SendEmailRoute.post('/createEmailTemplate', upload.single('resume'), createEmailTemplate);
SendEmailRoute.patch('/editEmailTemplate/:id', upload.single('resume'), editEmailTemplate);

export default SendEmailRoute;