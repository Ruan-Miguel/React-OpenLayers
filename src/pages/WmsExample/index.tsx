import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import MapComponent from "./components/Map";

import "ol/ol.css";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    width: "100vw",
  },
});

function WmsExample(): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <MapComponent />
    </div>
  );
}

export default WmsExample;
