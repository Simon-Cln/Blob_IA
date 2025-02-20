// CarInformations.js
import React, { useState } from 'react';
import { Card, Stack, Grid, Tooltip, Button } from '@mui/material';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import GreenLightning from 'assets/images/shapes/green-lightning.svg';
import colors from 'assets/theme/base/colors';
import CustomCircularProgress from '../CustomCircularProgress';
import bus from 'assets/images/shapes/bus.svg';
import tramway from 'assets/images/shapes/tramway.svg';
import train from 'assets/images/shapes/train.svg';
import metro from 'assets/images/shapes/metro.svg';
import team2 from "assets/images/blob2.png";
import Path from 'layouts/dashboard/components/Path';
import { useTransports } from 'layouts/dashboard/components/TransportContext';
import axios from 'axios';
import qs from 'qs';

const CarInformations = ({ updateRouteTitle }) => {
  const { selectedTransports, setSelectedTransports, startStop, setStartStop, endStop, setEndStop, setStops, setShortestPath, setError, setTotalTime, setComparisonResult } = useTransports();
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { gradients, info } = colors;
  const { cardContent } = gradients;
  const gradientColors = [cardContent.main, cardContent.state];

  function smoothScrollTo(element, duration, offset = 170) {
    const startingY = window.pageYOffset;
    const elementY = window.pageYOffset + element.getBoundingClientRect().top - offset;
    const diff = elementY - startingY;
    let start;

    function easingFunction(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      const time = timestamp - start;
      let percent = Math.min(time / duration, 1);

      percent = easingFunction(percent);

      window.scrollTo(0, startingY + diff * percent);

      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    });
  }

  const handleStart = async () => {
    console.log("Before launching:", { selectedTransports, startStop, endStop });

    if (isRunning || selectedTransports.length === 0 || !startStop || !endStop) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 200);
      return;
    }
    setIsRunning(true);
    setProgress(0);
    let value = 0;
    const interval = setInterval(() => {
      value += 1;
      setProgress(value);
      if (value >= 100) {
        clearInterval(interval);
        setIsRunning(false);
        if (typeof updateRouteTitle === 'function') {
          updateRouteTitle(startStop, endStop);
        }
        const mapSection = document.getElementById('map-section');
        if (mapSection) smoothScrollTo(mapSection, 500);
        console.log("After launching:", { selectedTransports, startStop, endStop });
      }
    }, 20);

    try {
      const transportTypeIds = selectedTransports.map(type => getTransportTypeId(type));
      const params = { 'transport_types': transportTypeIds };

      console.log('Making API request to get stops:', 'http://localhost:5000/get-stops-coordinates', { params });
      const stopsResponse = await axios.get('http://localhost:5000/get-stops-coordinates', {
        params,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
      });
      console.log("Stops response full data:", stopsResponse);
      console.log("Stops response data:", stopsResponse.data.slice(0, 5));
      setStops(stopsResponse.data);

      const pathParams = { start_stop: startStop, end_stop: endStop, 'transport_types': transportTypeIds };
      console.log('Making API request to get shortest path with params:', pathParams);
      const pathResponse = await axios.get('http://localhost:5000/get-shortest-path', {
        params: pathParams,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
      });

      console.log("Path response full data:", pathResponse);
      console.log("Path response data:", pathResponse.data.path.slice(0, 5));
      setShortestPath(pathResponse.data.path);
      setTotalTime(pathResponse.data.total_time);
      setComparisonResult(null); // Clear previous comparison result
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Unable to fetch data: " + error.message);
    }
  };

  const getTransportTypeId = (type) => {
    switch (type) {
      case 'Tramway': return 0;
      case 'Bus': return 3;
      case 'Train': return 2;
      case 'Métro': return 1;
      default: return -1;
    }
  };

  const handleTransportClick = (transport) => {
    setSelectedTransports(prev => prev.includes(transport) ? prev.filter(t => t !== transport) : [...prev, transport]);
  };

  const isSelected = (transport) => selectedTransports.includes(transport);

  return (
    <Card sx={({ breakpoints }) => ({
      width: '130%',
      margin: 'auto',
      top: '-81%',
      left: '-26%',
      height: '98%',
      [breakpoints.up('xxl')]: {
        maxHeight: '400px',
      },
    })}>
      <VuiBox display="flex" flexDirection="column" p={2}>
        <VuiTypography variant="lg">
          Le{'   '}
          <img src={team2} alt="blob" style={{ width: '25px', verticalAlign: 'middle' }} />
          {'   '}attend votre signal pour se multiplier
        </VuiTypography>
        <VuiTypography variant="body2" color="text" mb="12px">
          Choisissez au moins un moyen de transport à droite et appuyez sur "Lancer".
        </VuiTypography>
        <Stack
          spacing={3}
          sx={({ breakpoints }) => ({
            [breakpoints.up('sm')]: {
              flexDirection: 'column',
            },
            [breakpoints.up('md')]: {
              flexDirection: 'row',
            },
            [breakpoints.only('xl')]: {
              flexDirection: 'column',
            },
          })}
        >
          <VuiBox display="flex" flexDirection="column" alignItems="center">
            <Tooltip
              title="Vous devez d'abord choisir un moyen de transport, un point de départ et d'arrivée"
              open={showTooltip}
              disableHoverListener
              disableFocusListener
              disableTouchListener
            >
              <VuiBox sx={{ position: 'relative', display: 'inline-flex' }}>
                <CustomCircularProgress value={progress} size={170} gradientColors={gradientColors} />
                <VuiBox
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  position="absolute"
                  top="50%"
                  left="50%"
                  sx={{
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <VuiBox component="img" src={GreenLightning} alt="Green Lightning" />
                  <VuiTypography color="white" variant="h2" mt="3px" fontWeight="bold" mb="2px">
                    {progress}%
                  </VuiTypography>
                  <VuiTypography color="text" variant="caption">
                    <span
                      style={{ cursor: 'pointer', transition: 'color 0.3s' }}
                      onClick={handleStart}
                      onMouseOver={(e) => (e.currentTarget.style.color = '#00c853')}
                      onMouseOut={(e) => (e.currentTarget.style.color = '')}
                    >
                      {isRunning ? 'Recherche...' : 'Lancer'}
                    </span>
                  </VuiTypography>
                </VuiBox>
              </VuiBox>
            </Tooltip>
          </VuiBox>

          <Grid container spacing={2}>
            {[
              { label: 'Tramway', icon: tramway },
              { label: 'Métro', icon: metro },
              { label: 'Bus', icon: bus },
              { label: 'Train', icon: train },
            ].map((transport) => (
              <Grid item xs={12} md={6} key={transport.label}>
                <Tooltip title="Choisissez ce moyen de transport">
                  <VuiBox
                    display="flex"
                    p={2}
                    alignItems="center"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      minHeight: '110px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: isSelected(transport.label) ? '100%' : 0,
                        height: '100%',
                        background: 'rgba(0, 200, 83, 0.5)',
                        transition: 'width 0.5s ease-in-out',
                        zIndex: 1,
                      },
                    }}
                    onClick={() => handleTransportClick(transport.label)}
                  >
                    <VuiBox display="flex" flexDirection="column" mr="auto" zIndex={2}>
                      <VuiTypography color="text" variant="caption" fontWeight="medium" mb="2px">
                        {transport.label}
                      </VuiTypography>
                      <VuiTypography color="white" variant="h4" fontWeight="bold">
                        +{transport.label}
                      </VuiTypography>
                    </VuiBox>
                    <VuiBox
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      sx={{
                        background: info.main,
                        borderRadius: '12px',
                        width: '56px',
                        height: '56px',
                        left: '-50%',
                        zIndex: 2,
                      }}
                    >
                      <VuiBox
                        component="img"
                        src={transport.icon}
                        alt={`${transport.label} Icon`}
                        sx={{
                          width: 30,
                          height: 30,
                          filter: 'brightness(0) invert(1)',
                        }}
                      />
                    </VuiBox>
                  </VuiBox>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
          <Path onDepartChange={setStartStop} onArriveeChange={setEndStop} />
        </Stack>
      </VuiBox>
    </Card>
  );
};

export default CarInformations;
