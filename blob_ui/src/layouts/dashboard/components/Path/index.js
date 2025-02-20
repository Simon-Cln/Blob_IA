import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import colors from "assets/theme/base/colors";
import Depart from "assets/images/depart.png";
import Arrivee from "assets/images/arrivee.png";

const Path = ({ onDepartChange, onArriveeChange }) => {
  const { grey } = colors;
  const [anchorElDepart, setAnchorElDepart] = useState(null);
  const [anchorElArrivee, setAnchorElArrivee] = useState(null);
  const [selectedDepart, setSelectedDepart] = useState("Lieu de départ");
  const [selectedArrivee, setSelectedArrivee] = useState("Lieu d'arrivée");
  const [sites, setSites] = useState([]);
  const [error, setError] = useState(null);

  const fetchSites = () => {
    axios.get('http://localhost:5000/get-olympic-sites')
      .then(response => {
        setSites(response.data);
        setError(null);
      })
      .catch(error => {
        setError(error.message);
      });
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleClickDepart = (event) => {
    setAnchorElDepart(event.currentTarget);
  };

  const handleCloseDepart = (option) => {
    if (option) {
      setSelectedDepart(option);
      onDepartChange(option); // Notify parent component
    }
    setAnchorElDepart(null);
  };

  const handleClickArrivee = (event) => {
    setAnchorElArrivee(event.currentTarget);
  };

  const handleCloseArrivee = (option) => {
    if (option) {
      setSelectedArrivee(option);
      onArriveeChange(option); // Notify parent component
    }
    setAnchorElArrivee(null);
  };

  return (
    <Card id="delete-account" sx={{ width: "100%" }}>
      <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb="32px">
        <VuiTypography variant="lg" fontWeight="bold" color="white">
          Où voulez-vous aller ?
        </VuiTypography>
        <VuiButton variant="contained" color="info">
          HORAIRE
        </VuiButton>
      </VuiBox>
      {error && (
        <VuiBox mb="32px">
          <VuiTypography variant="body2" color="error">
            Erreur : {error}
          </VuiTypography>
        </VuiBox>
      )}
      <VuiBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <VuiBox
              border="2px solid"
              borderRadius="20px"
              borderColor={grey[600]}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p="22px 20px"
              onClick={handleClickDepart}
              sx={{ cursor: "pointer" }}
            >
              <img src={Depart} alt="Lieu de départ" width="21px" />
              <VuiTypography pl={2} variant="button" color="white" fontWeight="medium">
                {selectedDepart}
              </VuiTypography>
              <VuiBox ml="auto" lineHeight={0}>
                <Tooltip title="Modifier" placement="top">
                  <Icon sx={{ cursor: "pointer", color: "#fff" }} fontSize="small">
                    edit
                  </Icon>
                </Tooltip>
              </VuiBox>
            </VuiBox>
            <Menu
              anchorEl={anchorElDepart}
              open={Boolean(anchorElDepart)}
              onClose={() => handleCloseDepart(null)}
            >
              {sites.map((site) => (
                <MenuItem key={site.name} onClick={() => handleCloseDepart(site.name)}>
                  {site.name}
                </MenuItem>
              ))}
            </Menu>
          </Grid>
          <Grid item xs={12} md={6}>
            <VuiBox
              border="2px solid"
              borderRadius="20px"
              borderColor={grey[600]}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p="22px 20px"
              onClick={handleClickArrivee}
              sx={{ cursor: "pointer" }}
            >
              <img src={Arrivee} alt="Lieu d'arrivée" width="25px" />
              <VuiTypography pl={2} variant="button" color="white" fontWeight="medium">
                {selectedArrivee}
              </VuiTypography>
              <VuiBox ml="auto" lineHeight={0}>
                <Tooltip title="Modifier" placement="top">
                  <Icon sx={{ cursor: "pointer", color: "#fff" }} fontSize="small">
                    edit
                  </Icon>
                </Tooltip>
              </VuiBox>
            </VuiBox>
            <Menu
              anchorEl={anchorElArrivee}
              open={Boolean(anchorElArrivee)}
              onClose={() => handleCloseArrivee(null)}
            >
              {sites.map((site) => (
                <MenuItem key={site.name} onClick={() => handleCloseArrivee(site.name)}>
                  {site.name}
                </MenuItem>
              ))}
            </Menu>
          </Grid>
        </Grid>
      </VuiBox>
    </Card>
  );
};

export default Path;