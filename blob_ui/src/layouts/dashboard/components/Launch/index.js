import React from "react";
import Grid from "@mui/material/Grid";
import VuiBox from "components/VuiBox";
import CarInformations from "../CarInformations"; 
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";


function Launch({ updateRouteTitle, setStops, setShortestPath, setError }) {
  return (
    <DashboardLayout>
    <VuiBox mt={5} mb={3}>
      <Grid container spacing={3} sx={{ width: '100%', mx: 0 }}>
        <Grid item xs={12} xl={4} xxl={3}></Grid>
        <Grid item xs={12} xl={8} xxl={6}>
          <CarInformations updateRouteTitle={updateRouteTitle} setStops={setStops} setShortestPath={setShortestPath} setError={setError} />
        </Grid>
        <Grid item xs={12} xl={4} xxl={3}></Grid>
      </Grid>
    </VuiBox>
  </DashboardLayout>
  );
}

export default Launch;
