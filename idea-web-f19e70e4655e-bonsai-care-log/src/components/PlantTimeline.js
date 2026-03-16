import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PlantTimeline() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // Fetch plant data and photos from the server
    fetch(`/api/plants/${id}`)
      .then(response => response.json())
      .then(data => {
        setPlant(data.plant);
        setPhotos(data.photos);
      });
  }, [id]);

  if (!plant) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{plant.name}</h1>
      <p>Species: {plant.species}</p>
      <p>Acquired: {new Date(plant.acquiredDate).toLocaleDateString()}</p>
      <div>
        <h2>Photo Timeline</h2>
        {photos.map(photo => (
          <div key={photo.id}>
            <img src={photo.url} alt={photo.caption} />
            <p>{photo.caption}</p>
            <p>{new Date(photo.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlantTimeline;
