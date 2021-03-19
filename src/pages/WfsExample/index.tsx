import React, { useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@material-ui/core";

import MapComponent from "./components/Map";

import "ol/ol.css";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    width: "100vw",
  },
});

function WfsExample(): JSX.Element {
  const classes = useStyles();

  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
  });

  const handleClickOpen = useCallback(
    ({ title, content }: { title: string; content: string }) => {
      setModalContent({
        title,
        content,
      });
    },
    []
  );

  const handleClose = () => {
    setModalContent({
      title: "",
      content: "",
    });
  };

  return (
    <div className={classes.root}>
      <MapComponent openModal={handleClickOpen} />
      <Dialog onClose={handleClose} open={modalContent.title !== ""}>
        <DialogTitle>{modalContent.title}</DialogTitle>
        <DialogContent dividers>
          <Typography>{modalContent.content}</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WfsExample;
