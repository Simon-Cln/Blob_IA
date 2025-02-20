import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Paper, Typography, Box, CircularProgress, Button } from '@mui/material';
import team2 from "assets/images/blob2.png";
import './MapView.css';
import { useTransports } from 'layouts/dashboard/components/TransportContext';

const createIcon = (color, size = 3) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color:${color}; width:${size}px; height:${size}px; border-radius:50%;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const transportTypeToColor = {
  3: 'blue',    // bus
  0: 'green',   // tramway
  1: 'red',     // métro
  2: 'purple',  // train
};

const getRandomSubset = (array, percentage) => {
  const subsetSize = Math.ceil(array.length * percentage);
  const shuffledArray = [...array].sort(() => 0.5 - Math.random());
  return shuffledArray.slice(0, subsetSize);
};

const MapView = () => {
  const {
    selectedTransports,
    startStop,
    endStop,
    stops,
    shortestPath,
    blobPath, // Access blob path
    totalTime,
    comparisonResult,
    error,
    setTotalTime,
    setComparisonResult,
    setError,
    isRunning,
    compareWithblob
  } = useTransports();
  const [displayedPath, setDisplayedPath] = useState([]);
  const [blobDisplayedPath, setBlobDisplayedPath] = useState([]); // State for blob path
  const [loading, setLoading] = useState(true);

  const filteredStops = getRandomSubset(stops, 0.05);

  useEffect(() => {
    let frameId;
    let i = 0;

    const animate = () => {
      setDisplayedPath(prevPath => {
        const newPath = [...prevPath, shortestPath[i]];
        if (i < shortestPath.length - 1) {
          i++;
          frameId = requestAnimationFrame(animate);
        }
        return newPath;
      });
    };

    if (shortestPath.length > 0) {
      setDisplayedPath([]);
      animate();
      setTotalTime(shortestPath[shortestPath.length - 1].time - shortestPath[0].time);
      setLoading(false);
    }

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [shortestPath, setTotalTime]);

  useEffect(() => {
    let frameId;
    let i = 0;

    const animateBlob = () => {
      setBlobDisplayedPath(prevPath => {
        const newPath = [...prevPath, blobPath[i]];
        if (i < blobPath.length - 1) {
          i++;
          frameId = requestAnimationFrame(animateBlob);
        }
        return newPath;
      });
    };

    if (blobPath.length > 0) {
      setBlobDisplayedPath([]);
      animateBlob();
    }

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [blobPath]);

  const getIcon = (type) => {
    return createIcon(transportTypeToColor[type] || 'gray');
  };

  const startIcon = createIcon('orange', 10);
  const endIcon = createIcon('red', 10);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
  };

  useEffect(() => {
    console.log("MapView - selectedTransports:", selectedTransports);
    console.log("MapView - startStop:", startStop);
    console.log("MapView - endStop:", endStop);
  }, [selectedTransports, startStop, endStop]);

  return (
    <div style={{ height: '90%', width: '100%', position: 'relative' }}>
      <div style={{ height: '60%' }}>
        <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CartoDB</a>' />
          {filteredStops.map(stop => (
            <Marker
              key={stop.stop_id}
              position={[stop.lat, stop.lon]}
              icon={getIcon(stop.type)}
            >
              <Popup>{stop.stop_name}</Popup>
            </Marker>
          ))}
          {shortestPath.length > 0 && (
            <>
              <Marker
                key={shortestPath[0].stop_id}
                position={[shortestPath[0].lat, shortestPath[0].lon]}
                icon={startIcon}
              >
                <Popup>{shortestPath[0].stop_name}</Popup>
              </Marker>
              <Marker
                key={shortestPath[shortestPath.length - 1].stop_id}
                position={[shortestPath[shortestPath.length - 1].lat, shortestPath[shortestPath.length - 1].lon]}
                icon={endIcon}
              >
                <Popup>{shortestPath[shortestPath.length - 1].stop_name}</Popup>
              </Marker>
              <Polyline
                positions={displayedPath.map(stop => [stop.lat, stop.lon])}
                color="blue"
                weight={5}
                opacity={0.7}
                dashArray="4"
              />
            </>
          )}
          {blobPath.length > 0 && (
            <>
              <Marker
                key={blobPath[0].stop_id}
                position={[blobPath[0].lat, blobPath[0].lon]}
                icon={startIcon}
              >
                <Popup>{blobPath[0].stop_name}</Popup>
              </Marker>
              <Marker
                key={blobPath[blobPath.length - 1].stop_id}
                position={[blobPath[blobPath.length - 1].lat, blobPath[blobPath.length - 1].lon]}
                icon={endIcon}
              >
                <Popup>{blobPath[blobPath.length - 1].stop_name}</Popup>
              </Marker>
              <Polyline
                positions={blobDisplayedPath.map(stop => [stop.lat, stop.lon])}
                color="green"
                weight={5}
                opacity={0.7}
                dashArray="4"
              />
            </>
          )}
        </MapContainer>
      </div>
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Erreur : {error}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10%', margin: '10px 0', position: 'relative' }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f0f0f0',
              padding: '10px 20px',
              borderRadius: '25px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            <Typography variant="h4" component="span" sx={{ marginRight: '10px' }}>
              {formatTime(totalTime)}
            </Typography>
            <Typography variant="body2" component="span" color="textSecondary">
              min de trajet
            </Typography>
            <Button variant="contained" color="primary" onClick={compareWithblob} sx={{ marginLeft: '20px' }}>
              Comparer avec <img src={team2} alt="blob" style={{ height: '24px', marginLeft: '5px' }} />
            </Button>
          </Box>
        )}
      </div>
      {isRunning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CircularProgress />
        </div>
      )}
      {!loading && comparisonResult && (
        <div>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f0f0f0',
              padding: '10px 20px',
              borderRadius: '20px',
              position: 'relative',
              width: '470px',
              margin: 'auto',
              marginTop: '-10px',
              marginBottom: '10px',
            }}
          >
            {/* Conteneur flex pour aligner horizontalement le temps, "min pour le Blob" et le résultat de la comparaison */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" component="span" sx={{ marginRight: '10px' }}>
                {formatTime(comparisonResult.blobTime)}
              </Typography>
              <Typography variant="body2" component="span" color="textSecondary">
                min pour le <img src={team2} alt="blob" style={{ height: '24px', verticalAlign: 'middle', marginLeft: '5px' }} />
              </Typography>
              <Typography variant="body1" color={comparisonResult.isBlobBetter ? 'green' : 'red'} sx={{ marginLeft: '10px' }}>
                {comparisonResult.isBlobBetter ? 'Le blob est plus rapide!' : 'Dijkstra est meilleur!'}
              </Typography>
            </div>
          </Box>
        </div>
      )}
      {!loading && (
        <div style={{ height: '17%', overflowX: 'auto', padding: '10px 0', backgroundColor: '#f0f0f0', borderRadius: '10px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 'max-content', padding: '0 10px' }}>
            {shortestPath.map((stop, index) => (
              <React.Fragment key={index}>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                  <Paper elevation={3} sx={{ padding: '10px', textAlign: 'center', marginBottom: '10px', backgroundColor: transportTypeToColor[stop.type] || 'white' }}>
                    <Typography variant="body1" component="h1" sx={{ color: 'white' }}>
                      {stop.stop_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white' }}>{`Heure d'arrivée: ${formatTime(stop.time)}`}</Typography>
                  </Paper>
                  <div style={{ position: 'absolute', top: '50%', left: '100%', width: '30px', height: '2px', backgroundColor: 'black', transform: 'translateY(-50%)' }}></div>
                </div>
                {index < shortestPath.length - 1 && (
                  <div style={{ width: '30px', height: '2px', backgroundColor: 'black' }}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
