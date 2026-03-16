import axios from 'axios';

export const getMediaFromDropbox = async (token) => {
  const response = await axios.post(
    'https://api.dropboxapi.com/2/files/list_folder',
    { path: '' },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.entries
    .filter((entry) => entry['.tag'] === 'file' && (entry.name.endsWith('.jpg') || entry.name.endsWith('.png')))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      path: `https://content.dropboxapi.com/2/files/download?path=${encodeURIComponent(entry.path_lower)}`,
      modifiedTime: entry.server_modified,
      thumbnailUrl: `https://content.dropboxapi.com/2/files/get_thumbnail?path=${encodeURIComponent(entry.path_lower)}&size=w256h256`,
    }));
};
