import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GTFSUploader = ({ onFileSet }) => {
  const [error, setError] = useState(null);
  const [filePath, setFilePath] = useState('');

  useEffect(() => {
    const fetchGTFSFile = async () => {
      try {
        const response = await axios.get('/get-gtfs-file');
        onFileSet(response.data.gtfs_file);
      } catch (error) {
        console.log('GTFS file not set yet');
      }
    };

    fetchGTFSFile();
  }, [onFileSet]);

  const handleSetFile = async () => {
    try {
      const response = await axios.post('/set-gtfs-file', { gtfs_file: filePath });
      onFileSet(filePath);
    } catch (error) {
      setError('Failed to set GTFS file');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
        placeholder="Enter GTFS file path"
      />
      <button onClick={handleSetFile}>Set GTFS File</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default GTFSUploader;