// SendEmail.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SendEmail.css';
import { BASEURL } from '../utils';

const SendEmail = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [toEmail, setToEmail] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit‐mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch all templates (with full details)
  const fetchAllTemplates = async () => {
    try {
      const res = await axios.get(`${BASEURL}/api/v1/email/getEmailTemplate`);
      setTemplates(res.data.template || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  useEffect(() => {
    fetchAllTemplates();
  }, []);

  // When a template is selected: store it & initialize variables
  const handleTemplateSelect = (e) => {
    const chosenId = e.target.value;
    if (!chosenId) {
      setSelectedTemplate(null);
      setVariableValues({});
      setIsEditing(false);
      return;
    }
    const tpl = templates.find((t) => t._id === chosenId);
    setSelectedTemplate(tpl || null);

    // Initialize variableValues = { varName: '' } for each placeholder
    const initialVars = {};
    (tpl.variables || []).forEach((v) => {
      initialVars[v] = '';
    });
    setVariableValues(initialVars);
    setIsEditing(false);
  };

  // Update a variable’s value
  const handleVariableChange = (varName, value) => {
    setVariableValues((prev) => ({ ...prev, [varName]: value }));
  };

  // Send Email
  const handleSend = async () => {
    if (!selectedTemplate || !toEmail) {
      setStatusMessage('Please select a template and enter recipient email.');
      return;
    }
    setLoading(true);
    setStatusMessage('');

    try {
      await axios.post(`${BASEURL}/api/v1/email/sendEmailByTemplate`, {
        templateName: selectedTemplate.name,
        to: toEmail,
        data: variableValues,
        attachmentFileName: selectedTemplate.attachment || '',
      });
      setStatusMessage('✅ Email sent successfully!');
    } catch (err) {
      console.error('Error sending email:', err);
      setStatusMessage('❌ Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Enter edit mode: preload subject & body, clear file
  const startEditing = () => {
    if (!selectedTemplate) return;
    setEditSubject(selectedTemplate.subject);
    setEditBody(selectedTemplate.body.replace(/\\n/g, '\n')); // turn “\\n” into actual newlines
    setEditFile(null);
    setIsEditing(true);
    setStatusMessage('');
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setEditSubject('');
    setEditBody('');
    setEditFile(null);
  };

  // Save edits (subject, body, optional new PDF)
  const saveEdit = async () => {
    if (!selectedTemplate) return;
    if (!editSubject.trim() || !editBody.trim()) {
      setStatusMessage('Subject and Body cannot be empty.');
      return;
    }
    setSavingEdit(true);
    setStatusMessage('');

    try {
      const formData = new FormData();
      formData.append('subject', editSubject.trim());
      // Convert actual newlines back into “\\n” so the backend sees the same format
      formData.append('body', editBody.trim().replace(/\n/g, '\\n'));
      if (editFile) {
        formData.append('resume', editFile);
      }

      await axios.patch(
        `${BASEURL}/api/v1/email/editEmailTemplate/${selectedTemplate._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Re-fetch and re-select updated template
      await fetchAllTemplates();
      const updatedTpl = templates.find((t) => t._id === selectedTemplate._id);
      setSelectedTemplate(updatedTpl || null);
      setStatusMessage('✅ Template updated successfully.');
      setIsEditing(false);
      setEditFile(null);
    } catch (err) {
      console.error('Error updating template:', err);
      setStatusMessage('❌ Failed to update template.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="send-email-container">
      <h2 className="title">✉️ Send Email</h2>

      {/* 1. Template Selection */}
      <div className="field-group">
        <label htmlFor="template-select" className="label">
          Choose a Template:
        </label>
        <select
          id="template-select"
          className="dropdown"
          value={selectedTemplate ? selectedTemplate._id : ''}
          onChange={handleTemplateSelect}
        >
          <option value="">— Select Template —</option>
          {templates.map((tpl) => (
            <option key={tpl._id} value={tpl._id}>
              {tpl.subject}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Preview or Edit Card */}
      {selectedTemplate && (
        <div className="preview-card">
          {/* Edit icon (top-right) */}
          {!isEditing && (
            <button
              className="edit-icon"
              onClick={startEditing}
              title="Edit Template"
            >
              ✏️
            </button>
          )}

          {isEditing ? (
            // ✏️ EDIT MODE
            <div className="edit-form">
              <div className="field-group">
                <label htmlFor="edit-subject" className="label">
                  Edit Subject:
                </label>
                <input
                  id="edit-subject"
                  type="text"
                  className="input"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="New subject"
                />
              </div>

              <div className="field-group">
                <label htmlFor="edit-body" className="label">
                  Edit Body:
                </label>
                <textarea
                  id="edit-body"
                  className="textarea"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={6}
                  placeholder="New body text..."
                />
              </div>

              <div className="field-group">
                <label htmlFor="edit-file" className="label">
                  Upload New PDF:
                </label>
                <input
                  id="edit-file"
                  type="file"
                  accept="application/pdf"
                  className="input"
                  onChange={(e) => setEditFile(e.target.files[0] || null)}
                />
              </div>

              <div className="edit-buttons">
                <button
                  className="save-button"
                  onClick={saveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving…' : 'Save'}
                </button>
                <button
                  className="cancel-button"
                  onClick={cancelEdit}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // 📄 VIEW MODE
            <>
              <h3 className="preview-subject">
                Subject: {selectedTemplate.subject}
              </h3>
              <div className="preview-body">
                {selectedTemplate.body
                  .split('\\n')
                  .map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
              </div>

              {/* Download PDF if attachment */}
              {selectedTemplate.attachment && (
                <div className="attachment-link">
                  <a
                    href={`${BASEURL}/preview/${selectedTemplate.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 Download Attached PDF
                  </a>
                </div>
              )}

              {/* Dynamic Variable Inputs */}
              {selectedTemplate.variables &&
                selectedTemplate.variables.length > 0 && (
                  <div className="variables-section">
                    <h4 className="variables-title">Fill in Variables:</h4>
                    {selectedTemplate.variables.map((varName) => (
                      <div className="field-group" key={varName}>
                        <label htmlFor={varName} className="label">
                          {varName.charAt(0).toUpperCase() + varName.slice(1)}:
                        </label>
                        <input
                          type="text"
                          id={varName}
                          className="input"
                          value={variableValues[varName] || ''}
                          onChange={(e) =>
                            handleVariableChange(varName, e.target.value)
                          }
                          placeholder={`Enter ${varName}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>
      )}

      {/* 3. Recipient Email Input */}
      <div className="field-group">
        <label htmlFor="to-email" className="label">
          Recipient Email:
        </label>
        <input
          type="email"
          id="to-email"
          className="input"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          placeholder="recipient@example.com"
        />
      </div>

      {/* 4. Send Button */}
      <button
        className="send-button"
        onClick={handleSend}
        disabled={
          loading || !selectedTemplate || !toEmail || isEditing
        }
      >
        {loading ? 'Sending…' : 'Send Email'}
      </button>

      {/* 5. Status Message */}
      {statusMessage && (
        <p
          className={`status-message${
            statusMessage.startsWith('✅') ? ' success' : ''
          }`}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default SendEmail;
