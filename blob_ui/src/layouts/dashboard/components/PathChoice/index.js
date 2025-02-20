import Grid from "@mui/material/Grid";
import VuiBox from "components/VuiBox";
import Path from "layouts/dashboard/components/Path";

function PathChoice() {
  return (
    <VuiBox mt={4} width="100%"> 
      <VuiBox mb={1.5}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={12} xl={12}> 
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Path />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </VuiBox>
    </VuiBox>
  );
}
export default PathChoice;