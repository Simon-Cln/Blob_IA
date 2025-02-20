import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const DashboardLayout = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '10%',
      maxHeight: '8vh', // Limite la hauteur à 80% de la hauteur de la fenêtre
      overflow: 'auto',  // Permet le défilement à l'intérieur
    }}
  >
    {children}
  </Box>
);

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;