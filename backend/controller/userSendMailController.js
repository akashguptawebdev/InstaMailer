import { sendEmailFunction } from "../config/nodemailerConfig.js";
import EmailTemplateModel from "../model/emailTemplateModel.js"
import deleteUploadedFile from "../utils/deleteUploadedFileUtils.js";

export const testSendEmail = async (req, res)=>{

    try {
        const {sendEmailFrom ,  senderEMailTo} = req.body;

     const result =  await sendEmailFunction("akashkashyapy@gmail.com", "testing", `checing des`);

        res.status(200).json({
            success:true,
            message:result
        })

    } catch (error) {
        res.status(400).json({
            success:false,
            message: error.message
        })
    }
}

// GET TEMPLATE BY NAME
export const getEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplateModel.find();

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({ template });
  } catch (error) {
    console.error("Error getting email template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// SEND EMAIL WITH TEMPLATE
// export const sendEmailWithTemplate = async (req, res) => {
//   try {
//     const { templateName, to , attachmentFileName } = req.body;

//     if (!templateName || !to ) {
//       return res.status(400).json({ message: "templateName, to, and data are required" });
//     }

//     const template = await EmailTemplateModel.findOne({ name: templateName});

//     if (!template) {
//       return res.status(404).json({ message: "Template not found" });
//     }
//     const result = await sendEmailFunction(to, template.subject, template.body , attachmentFileName);

//     res.status(200).json({ message: "Email sent", success:true , result });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// SEND EMAIL WITH TEMPLATE
export const sendEmailWithTemplate = async (req, res) => {
  try {
    const { templateName, to, attachmentFileName } = req.body;

    if (!templateName || !to) {
      return res.status(400).json({ message: "templateName and to are required" });
    }

    const template = await EmailTemplateModel.findOne({ name: templateName });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

     // 🛠 Format and style the body
    const formattedBody = template.body.replace(/\\n/g, "<br/>");

    const styledBody = `
      <div style="color: black; font-family: Arial, sans-serif; line-height: 1.6;">
        ${formattedBody.replace(
          /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
          `<a href="$1" style="color: black; text-decoration: none;">$2</a>`
        )}
      </div>
    `;

    const result = await sendEmailFunction(to, template.subject, styledBody, attachmentFileName);

    res.status(200).json({ message: "Email sent", success: true, result });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, variables } = req.body;

    // Basic validation
    if (!name || !subject || !body) {
      return res.status(400).json({ message: "name, subject, and body are required." });
    }

    // Check if template with same name already exists
    const existingTemplate = await EmailTemplateModel.findOne({ name });
    if (existingTemplate) {
      return res.status(409).json({ message: "Template with this name already exists." });
    }

    // Get uploaded filename if a file was uploaded
    const attachment = req.file ? req.file.filename : null;

    // Create new template
    const newTemplate = new EmailTemplateModel({
      name,
      subject,
      body,
      variables: variables || [],
      attachment // save the filename only
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      message: "Email template created successfully.",
      template: newTemplate
    });
  } catch (error) {
    console.error("Error creating email template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const editEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params; // template ID from URL
    const { name, subject, body, variables } = req.body;

    // Check if the template exists
    const template = await EmailTemplateModel.findById(id);
    if (!template) {
      deleteUploadedFile(req.file.filename)
      return res.status(404).json({ message: "Template not found." });
    }

    // If a new file was uploaded, update attachment
    if (req.file) {
      await deleteUploadedFile(template.attachment)
      template.attachment = req.file.filename;

      console.log("fileName ", req.file.filename)
    }
    // res.json("done")
    // return;

    // Update fields if provided
    if (name) template.name = name;
    if (subject) template.subject = subject;
    if (body) template.body = body;
    if (variables) template.variables = variables;

    await template.save();

    res.status(200).json({
      success: true,
      message: "Email template updated successfully.",
      template
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
