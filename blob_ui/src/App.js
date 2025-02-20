import { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import axios from 'axios';

import Sidenav from "examples/Sidenav";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import routes from "routes";
import { useVisionUIController, setMiniSidenav } from "context";
import newLogo from "assets/images/blobasse.png";
import Preloader from "./layouts/Preloader";

export default function App() {
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, direction, layout, sidenavColor } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [gtfsFile, setGtfsFile] = useState(null);
  const [stops, setStops] = useState([]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const fetchGTFSFile = async () => {
      try {
        const response = await axios.get('/get-gtfs-file');
        if (response.data && response.data.gtfs_file) {
          setGtfsFile(response.data.gtfs_file);
          console.log('GTFS file set successfully:', response.data.gtfs_file);
        } else {
          throw new Error('GTFS file path not returned from the endpoint');
        }
      } catch (error) {
        console.error('Error fetching or setting GTFS file:', error.message);
      }
    };
    fetchGTFSFile();
  }, []);

  const fetchStops = async () => {
    try {
      const response = await axios.get('/get-stops');
      setStops(response.data);
      console.log("Stops fetched successfully:", response.data);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={<route.component />} key={route.key} />;
      }

      return null;
    });

  if (loading) {
    return <Preloader setLoading={setLoading} />;
  }

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <Sidenav
            color={sidenavColor}
            brand={newLogo}
            brandName="BLOB IA"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        )}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <Sidenav
          color={sidenavColor}
          brand={newLogo}
          brandName="BLOB IA"
          routes={routes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}
