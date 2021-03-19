import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import Header from "./components/Header";

import SimpleMap from "./pages/SimpleMap";
import WfsExample from "./pages/WfsExample";

export default function Routes(): JSX.Element {
  return (
    <BrowserRouter>
      <Route path="/" component={Header} />
      <Switch>
        <Route path="/SimpleMap" component={SimpleMap} />
        <Route path="/WfsExample" component={WfsExample} />
        <Route exact path="*">
          <Redirect to={{ pathname: "/SimpleMap" }} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
