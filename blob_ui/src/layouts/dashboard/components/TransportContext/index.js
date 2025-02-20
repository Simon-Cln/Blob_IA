import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const TransportContext = createContext();

export const TransportProvider = ({ children }) => {
  const [selectedTransports, setSelectedTransports] = useState([]);
  const [startStop, setStartStop] = useState("");
  const [endStop, setEndStop] = useState("");
  const [shortestPath, setShortestPath] = useState([]);
  const [blobPath, setBlobPath] = useState([]); // New state for blob path
  const [stops, setStops] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const getTransportTypeId = (type) => {
    switch (type) {
      case 'Tramway': return 0;
      case 'Bus': return 3;
      case 'Train': return 2;
      case 'Métro': return 1;
      default: return -1;
    }
  };

  const compareWithblob = async () => {
    console.log("compareWithAStar function called");

    setIsRunning(true); // Start loading spinner

    console.log("isRunning:", isRunning);
    console.log("selectedTransports.length:", selectedTransports.length);
    console.log("startStop:", startStop);
    console.log("endStop:", endStop);

    if (selectedTransports.length === 0 || !startStop || !endStop) {
      setIsRunning(false);
      return;
    }

    try {
      const transportTypeIds = selectedTransports.map(type => getTransportTypeId(type));
      const params = { start_stop: startStop, end_stop: endStop, 'transport_types': transportTypeIds, departure_time: "08:00" };

      console.log("Comparing with blob - Params:", params);  // Log the params

      const response = await axios.get('http://localhost:5000/get-shortest-path-blob', { params });

      // Log the response
      console.log("Blob Response:", response.data);

      const blobPath = response.data.path;
      const blobTotalTime = response.data.total_time;

      setComparisonResult({
        dijkstraTime: totalTime,
        blobTime: blobTotalTime,
        isBlobBetter: blobTotalTime < totalTime
      });

      setBlobPath(blobPath); // Set blob path
    } catch (error) {
      console.error("Error fetching blob path:", error);  // Log the error
      setError("Unable to fetch blob path: " + error.message);
    } finally {
      setIsRunning(false); // Stop loading spinner
    }
  };

  return (
    <TransportContext.Provider value={{
      selectedTransports,
      setSelectedTransports,
      startStop,
      setStartStop,
      endStop,
      setEndStop,
      shortestPath,
      setShortestPath,
      blobPath, // Add blobPath to context
      stops,
      setStops,
      totalTime,
      setTotalTime,
      comparisonResult,
      setComparisonResult,
      error,
      setError,
      isRunning,
      compareWithblob,
    }}>
      {children}
    </TransportContext.Provider>
  );
};

export const useTransports = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransports must be used within a TransportProvider');
  }
  return context;
}

export default TransportContext;
