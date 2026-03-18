import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plants')
      .then(response => response.json())
      .then(data => {
        setPlants(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching plants:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading your plants...</div>;
  }

  return (
    <div style={styles.container}>
      <h1>My Plants</h1>
      <Link to="/add-plant">
        <button style={styles.addButton}>+ Add New Plant</button>
      </Link>
      {plants.length === 0 ? (
        <p>No plants yet. Add your first plant to get started!</p>
      ) : (
        <ul style={styles.plantList}>
          {plants.map(plant => (
            <li key={plant._id} style={styles.plantItem}>
              <Link to={`/plant/${plant._id}`} style={styles.plantLink}>
                <h2>{plant.name}</h2>
                <p>{plant.species}</p>
                <p>Acquired: {new Date(plant.acquiredDate).toLocaleDateString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  addButton: {
    backgroundColor: '#2e8b57',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  plantList: {
    listStyle: 'none',
    padding: 0
  },
  plantItem: {
    backgroundColor: '#f5f5f5',
    marginBottom: '12px',
    borderRadius: '8px',
    transition: 'background-color 0.2s'
  },
  plantLink: {
    display: 'block',
    padding: '16px',
    color: 'inherit',
    textDecoration: 'none'
  }
};

export default MyPlants;
