import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

function AddPlant() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    acquiredDate: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.name || !formData.species || !formData.acquiredDate) {
      setError('All fields are required');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add plant');
      }

      const newPlant = await response.json();
      history.push(`/plant/${newPlant._id}`);
    } catch (err) {
      setError('Failed to add plant. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Add New Plant</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>Plant Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            placeholder="e.g., My Monstera"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="species" style={styles.label}>Species</label>
          <input
            type="text"
            id="species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            style={styles.input}
            placeholder="e.g., Monstera deliciosa"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="acquiredDate" style={styles.label}>Acquired Date</label>
          <input
            type="date"
            id="acquiredDate"
            name="acquiredDate"
            value={formData.acquiredDate}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttonGroup}>
          <button
            type="submit"
            disabled={submitting}
            style={styles.submitButton}
          >
            {submitting ? 'Adding...' : 'Add Plant'}
          </button>
          <button
            type="button"
            onClick={() => history.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: '24px',
    borderRadius: '8px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  error: {
    color: '#d32f2f',
    marginBottom: '16px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2e8b57',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#757575',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default AddPlant;
