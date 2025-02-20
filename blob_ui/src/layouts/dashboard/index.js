import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Card } from '@mui/material';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Launch from 'layouts/dashboard/components/Launch';
import Welcome from 'layouts/dashboard/components/Welcome';
import MapView from 'layouts/dashboard/components/MapView';
import { TransportProvider } from 'layouts/dashboard/components/TransportContext';

function Dashboard() {
  const [routeTitle, setRouteTitle] = useState("Trajet le plus court entre ... et ...");
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [selectedTransports, setSelectedTransports] = useState([]);
  const [departureTime, setDepartureTime] = useState("");
  const [stops, setStops] = useState([]);  // Initialize stops as an empty array
  const [shortestPath, setShortestPath] = useState([]);  // Initialize shortestPath as an empty array
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [totalTime, setTotalTime] = useState(0);

  const updateRouteTitle = (newDepart, newArrivee) => {
    setRouteTitle(`Trajet le plus court entre ${newDepart} et ${newArrivee}`);
  };

  return (
    <TransportProvider>
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3}>
          <VuiBox mb={3}>
            <VuiBox mt={0} mb={3}>
              <Grid
                container
                spacing={0}
                sx={({ breakpoints }) => ({
                  [breakpoints.only("xl")]: {
                    gridTemplateColumns: "repeat(2, 1fr)",
                  },
                })}
              >
                <Grid
                  item
                  xs={11}
                  xl={5}
                  sx={({ breakpoints }) => ({
                    minHeight: "600px",
                  })}
                >
                  <Welcome />
                </Grid>
                <Grid item xs={12}>
                  <Launch 
                    updateRouteTitle={updateRouteTitle} 
                    setStops={setStops} 
                    setShortestPath={setShortestPath} 
                    setError={setError} 
                    setComparisonResult={setComparisonResult}
                    totalTime={totalTime}
                  />
                </Grid>
              </Grid>
            </VuiBox>
            <VuiBox>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ top: "-80%", height: '930px' }}>
                    <VuiBox sx={{ height: "100%" }}>
                      <VuiTypography variant="lg" color="white" fontWeight="bold" mb="5px">
                        {routeTitle}
                      </VuiTypography>
                      <VuiBox display="flex" alignItems="center" mb="40px">
                        <VuiTypography variant="button" color="success" fontWeight="bold">
                          Dijkstra{" "}
                          <VuiTypography variant="button" color="text" fontWeight="regular">
                            - JO 2024
                          </VuiTypography>
                        </VuiTypography>
                      </VuiBox>
                      <VuiBox sx={{ height: "900px" }} id="map-section">
                        <MapView 
                          selectedTransports={selectedTransports} 
                          startStop={depart} 
                          endStop={arrivee} 
                          stops={stops}
                          shortestPath={shortestPath}
                          error={error}
                          comparisonResult={comparisonResult}
                        />

                      </VuiBox>
                    </VuiBox>
                  </Card>
                </Grid>
              </Grid>
            </VuiBox>
          </VuiBox>
        </VuiBox>
      </DashboardLayout>
    </TransportProvider>
  );
}

export default Dashboard;