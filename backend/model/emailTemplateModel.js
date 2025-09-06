import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    variables: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    attachment: { type: String }
  },
  { timestamps: true }
);
const EmailTemplateModel = mongoose.model('EmailTemplate', emailTemplateSchema);
export default EmailTemplateModel;
