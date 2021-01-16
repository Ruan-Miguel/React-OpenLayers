import React, { useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";

import MapComponent from "./components/Map";

import "ol/ol.css";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    width: "100vw",
  },
});

function SimpleMap(): JSX.Element {
  const classes = useStyles();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const handleGeolocationError = useCallback((message: string) => {
    setSnackbar({
      open: true,
      message,
    });
  }, []);

  return (
    <div className={classes.root}>
      <MapComponent handleGeolocationError={handleGeolocationError} />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbar({
            open: false,
            message: "",
          });
        }}
        message={snackbar.message}
      />
    </div>
  );
}

export default SimpleMap;
