import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Image as ImageLayer } from "ol/layer";
import { OSM } from "ol/source";
import ImageWMS from "ol/source/ImageWMS";
import WMSCapabilities from "ol/format/WMSCapabilities";

import "ol/ol.css";

const useStyles = makeStyles({
  mapStyle: {
    height: "100%",
  },
  loading: {
    height: "100%",
    width: "100%",

    position: "absolute",
    top: 0,

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(0, 0, 0, .6)",
  },
});

function MapComponent(): JSX.Element {
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(true);

  const mapRef = useRef<HTMLDivElement>(null);

  const mapComponentRef = useRef(
    new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        projection: "EPSG:4326",
        zoom: 2,
      }),
    })
  );

  useEffect(() => {
    const map = mapComponentRef.current;
    map.setTarget(mapRef.current as HTMLDivElement);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    const imageLayer = new ImageLayer({
      source: new ImageWMS({
        url: "https://geoservicos.ibge.gov.br/geoserver/ows",
        params: { LAYERS: "CGEO:andb2019_lim_municipal_2018_join_var025" },
      }),
    });
    mapComponentRef.current.addLayer(imageLayer);

    const renderImage = new Promise((resolve, reject) => {
      imageLayer.once("postrender", () => {
        resolve(undefined);
      });

      imageLayer.once("error", () => {
        reject();
      });
    });

    const fitImage = new Promise((resolve, reject) => {
      fetch(
        "https://geoservicos.ibge.gov.br/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities"
      )
        .then((response) => response.text())
        .then((text) => {
          const result = new WMSCapabilities().read(text);
          const currentLayer = result.Capability.Layer.Layer.find(
            (layer: { [key: string]: string }) =>
              layer.Name === "CGEO:andb2019_lim_municipal_2018_join_var025"
          );

          const currentBoundingBox = currentLayer.BoundingBox.find(
            (boundingBox: { [key: string]: string }) =>
              boundingBox.crs === "EPSG:4326" || boundingBox.crs === "CRS:84"
          );

          const { extent } = currentBoundingBox;

          mapComponentRef.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            callback: () => {
              resolve(undefined);
            },
          });
        })
        .catch(() => {
          reject();
        });
    });

    Promise.allSettled([fitImage, renderImage]).then(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <div ref={mapRef} className={classes.mapStyle} />
      {isLoading && (
        <div className={classes.loading}>
          <CircularProgress disableShrink />
        </div>
      )}
    </>
  );
}

export default MapComponent;
