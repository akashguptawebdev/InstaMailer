// CreateNewTemplate.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './CreateNewTemplate.css';
import { BASEURL } from '../utils';

const CreateNewTemplate = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    status: 'active',
    resume: null,
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      resume: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Basic front-end validation
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setStatusType('error');
      setStatusMessage('Name, subject, and body are required.');
      return;
    }

    setLoading(true);
    setStatusMessage('');
    setStatusType('');

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('subject', formData.subject.trim());
      data.append('body', formData.body.trim());
      data.append('status', formData.status);
      if (formData.resume) {
        data.append('resume', formData.resume);
      }

      const res = await axios.post(
        `${BASEURL}/api/v1/email/createEmailTemplate`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      setStatusType('success');
      setStatusMessage('Template created successfully.');
      // Optionally reset form:
      setFormData({
        name: '',
        subject: '',
        body: '',
        status: 'active',
        resume: null,
      });
    } catch (error) {
      console.error('Error submitting template:', error);
      setStatusType('error');
      if (error.response?.data?.message) {
        setStatusMessage(error.response.data.message);
      } else if (error.code === 'ECONNABORTED') {
        setStatusMessage('Request timed out. Please try again.');
      } else {
        setStatusMessage('Failed to create template. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-template-container">
      <h2 className="title">📝 Create New Template</h2>
      <form className="form" onSubmit={handleSubmit}>
        {/* Row 1: Name and Subject */}
        <div className="row">
          <div className="field-group">
            <label htmlFor="name" className="label">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Enter template name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="subject" className="label">Subject:</label>
            <input
              id="subject"
              name="subject"
              type="text"
              className="input"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Row 2: Body */}
        <div className="row">
          <div className="field-group full-width">
            <label htmlFor="body" className="label">Body:</label>
            <textarea
              id="body"
              name="body"
              className="textarea"
              placeholder="Enter email body"
              value={formData.body}
              onChange={handleChange}
              rows={6}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Row 3: Resume Upload */}
        <div className="row">
          <div className="field-group full-width">
            <label htmlFor="resume" className="label">Upload Resume (PDF):</label>
            <input
              id="resume"
              name="resume"
              type="file"
              className="input"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
            />
            {formData.resume && (
              <p className="file-name">📎 {formData.resume.name}</p>
            )}
          </div>
        </div>

        {/* Row 4: Status */}
        <div className="row">
          <div className="field-group">
            <label htmlFor="status" className="label">Status:</label>
            <select
              id="status"
              name="status"
              className="input"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Row 5: Submit */}
        <div className="row">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Template'}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <p className={`status-message ${statusType}`}>
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );    
};

export default CreateNewTemplate;
