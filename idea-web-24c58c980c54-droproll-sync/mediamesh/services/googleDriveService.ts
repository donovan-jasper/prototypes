import axios from 'axios';

export const getMediaFromGoogleDrive = async (token) => {
  const response = await axios.get(
    'https://www.googleapis.com/drive/v3/files',
    {
      params: {
        q: "mimeType contains 'image/'",
        fields: 'files(id, name, modifiedTime, thumbnailLink, webContentLink)',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.files.map((file) => ({
    id: file.id,
    name: file.name,
    path: file.webContentLink,
    modifiedTime: file.modifiedTime,
    thumbnailUrl: file.thumbnailLink,
  }));
};
