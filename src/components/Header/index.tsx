import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import {
  makeStyles,
  unstable_createMuiStrictModeTheme as unstableCreateMuiStrictModeTheme,
} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MapIcon from "@material-ui/icons/Map";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

const theme = unstableCreateMuiStrictModeTheme();

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  },
});

export default function Header(): JSX.Element {
  const classes = useStyles();
  const [state, setState] = useState(false);

  const url = useLocation().pathname.slice(1);

  const toggleDrawer = (open: boolean) => () => {
    setState(open);
  };

  const list = () => (
    <div className={classes.list} role="presentation">
      <List>
        {["SimpleMap"].map((text) => (
          <ListItem
            button
            disabled={text === url}
            component={Link}
            to={text}
            key={text}
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          onClick={toggleDrawer(true)}
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Maps
        </Typography>
      </Toolbar>
      <ThemeProvider theme={theme}>
        <Drawer anchor="left" open={state} onClose={toggleDrawer(false)}>
          {list()}
        </Drawer>
      </ThemeProvider>
    </AppBar>
  );
}
