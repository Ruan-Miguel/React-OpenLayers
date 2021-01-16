import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point } from "ol/geom";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import Overlay from "ol/Overlay";
import OverlayPositioning from "ol/OverlayPositioning";

import "ol/ol.css";

const view = new View({
  center: [0, 0],
  projection: "EPSG:4326",
  zoom: 2,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view,
});

const accuracyFeature = new Feature();

const positionFeature = new Feature({
  name: "currentPosition",
  message: "You are here",
});
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({
        color: "#3399CC",
      }),
      stroke: new Stroke({
        color: "#fff",
        width: 2,
      }),
    }),
  })
);

const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

const useStyles = makeStyles({
  mapStyle: {
    height: "100%",
  },
  popup: {
    backgroundColor: "#fff",
    padding: "2px 5px",
    borderRadius: "3px",

    "&::before": {
      position: "absolute",
      zIndex: -1,
      content: "''",
      right: "50%",
      transform: "translateX(50%)",
      bottom: "-8px",
      borderStyle: "solid",
      borderWidth: "10px 10px 0 10px",
      borderColor: "transparent",
      borderTopColor: "white",
    },
  },
});

function MapComponent({
  handleGeolocationError,
}: {
  handleGeolocationError: (message: string) => void;
}): JSX.Element {
  const classes = useStyles();

  const [popupContent, setPopupContent] = useState("");

  const [cursor, setCursor] = useState("default");

  const cursorSubstitute = useRef(cursor);

  const mapRef = useRef<HTMLDivElement>(null);

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geolocation.on("error", (err) => {
      handleGeolocationError(err.message);
    });
  }, [handleGeolocationError]);

  useEffect(() => {
    map.setTarget(mapRef.current as HTMLDivElement);

    geolocation.once("change:accuracyGeometry", () => {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    geolocation.once("change:position", () => {
      const coordinates = geolocation.getPosition();

      view.setCenter(coordinates);
      view.setZoom(18);
    });

    geolocation.on("change:position", () => {
      const coordinates = geolocation.getPosition();

      if (coordinates) {
        positionFeature.setGeometry(new Point(coordinates));
      }
    });

    geolocation.setTracking(true);

    // eslint-disable-next-line no-new
    new VectorLayer({
      map,
      source: new VectorSource({
        features: [accuracyFeature, positionFeature],
      }),
    });

    map.on("pointermove", (e) => {
      if (e.dragging) {
        return;
      }

      const pixel = map.getEventPixel(e.originalEvent);
      const shouldBePointer = map.getFeaturesAtPixel(pixel).some((feature) => {
        const featureName = feature.get("name");
        return (
          typeof featureName === "string" && featureName === "currentPosition"
        );
      });

      if (shouldBePointer) {
        if (cursorSubstitute.current !== "pointer") {
          setCursor("pointer");
          cursorSubstitute.current = "pointer";
        }
      } else if (cursorSubstitute.current !== "default") {
        setCursor("default");
        cursorSubstitute.current = "default";
      }
    });

    const popup = new Overlay({
      element: popupRef.current as HTMLDivElement,
      positioning: OverlayPositioning.BOTTOM_CENTER,
      stopEvent: false,
      offset: [0, -30],
    });
    map.addOverlay(popup);

    map.on("click", (evt) => {
      const currentPositionFeature = map
        .getFeaturesAtPixel(evt.pixel)
        .find((feature) => {
          const featureName = feature.get("name");
          return (
            typeof featureName === "string" && featureName === "currentPosition"
          );
        });

      if (currentPositionFeature) {
        const geometry = currentPositionFeature.getGeometry();
        if (geometry && geometry instanceof Point) {
          const coordinates = geometry.getCoordinates();

          setPopupContent(currentPositionFeature.get("message"));
          popup.setPosition(coordinates);
        }
      } else {
        setPopupContent("");
        popup.setPosition(undefined);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div ref={mapRef} style={{ cursor }} className={classes.mapStyle}>
      <div ref={popupRef} className={classes.popup}>
        {popupContent}
      </div>
    </div>
  );
}

export default MapComponent;
