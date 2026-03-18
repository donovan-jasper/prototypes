import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PlantTimeline() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    url: '',
    caption: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlantData();
  }, [id]);

  const fetchPlantData = () => {
    fetch(`/api/plants/${id}`)
      .then(response => response.json())
      .then(data => {
        setPlant(data.plant);
        setPhotos(data.photos);
      })
      .catch(err => {
        console.error('Error fetching plant data:', err);
      });
  };

  const handleUploadChange = (e) => {
    setUploadData({
      ...uploadData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData({
          ...uploadData,
          url: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    if (!uploadData.url) {
      setError('Please select an image');
      setUploading(false);
      return;
    }

    try {
      const response = await fetch(`/api/plants/${id}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: uploadData.url,
          caption: uploadData.caption,
          date: new Date()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const newPhoto = await response.json();
      setPhotos([...photos, newPhoto]);
      setUploadData({ url: '', caption: '' });
      setShowUploadForm(false);
      setUploading(false);
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      setUploading(false);
    }
  };

  if (!plant) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1>{plant.name}</h1>
      <p style={styles.species}>Species: {plant.species}</p>
      <p style={styles.acquired}>Acquired: {new Date(plant.acquiredDate).toLocaleDateString()}</p>
      
      <div style={styles.timelineHeader}>
        <h2>Photo Timeline</h2>
        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={styles.addPhotoButton}
        >
          {showUploadForm ? 'Cancel' : '+ Add Photo'}
        </button>
      </div>

      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} style={styles.uploadForm}>
          <div style={styles.formGroup}>
            <label htmlFor="photoFile" style={styles.label}>Select Image</label>
            <input
              type="file"
              id="photoFile"
              accept="image/*"
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            {uploadData.url && (
              <img 
                src={uploadData.url} 
                alt="Preview" 
                style={styles.preview}
              />
            )}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="caption" style={styles.label}>Caption</label>
            <input
              type="text"
              id="caption"
              name="caption"
              value={uploadData.caption}
              onChange={handleUploadChange}
              style={styles.input}
              placeholder="Add a caption for this photo"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={uploading}
            style={styles.submitButton}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
      )}

      <div style={styles.timeline}>
        {photos.length === 0 ? (
          <p style={styles.noPhotos}>No photos yet. Add your first photo to start tracking growth!</p>
        ) : (
          photos.map(photo => (
            <div key={photo._id} style={styles.photoCard}>
              <img src={photo.url} alt={photo.caption} style={styles.photo} />
              <div style={styles.photoInfo}>
                <p style={styles.caption}>{photo.caption}</p>
                <p style={styles.date}>{new Date(photo.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  species: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '8px'
  },
  acquired: {
    fontSize: '16px',
    color: '#888',
    marginBottom: '24px'
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  addPhotoButton: {
    backgroundColor: '#2e8b57',
    color: 'white',
    padding: '10px 20px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  uploadForm: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333'
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  preview: {
    marginTop: '12px',
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '4px',
    border: '2px solid #ddd'
  },
  error: {
    color: '#d32f2f',
    marginBottom: '12px'
  },
  submitButton: {
    backgroundColor: '#2e8b57',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  noPhotos: {
    textAlign: 'center',
    color: '#888',
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  photo: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  photoInfo: {
    padding: '16px'
  },
  caption: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '8px',
    fontWeight: '500'
  },
  date: {
    fontSize: '14px',
    color: '#888'
  }
};

export default PlantTimeline;
