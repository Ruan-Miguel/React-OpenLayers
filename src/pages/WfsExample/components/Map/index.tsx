import React, { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import { Stroke, Style } from "ol/style";
import VectorSource from "ol/source/Vector";
import { WFS, GeoJSON } from "ol/format";
import { getXMLSerializer } from "ol/xml";

import "ol/ol.css";

const useStyles = makeStyles({
  mapStyle: {
    height: "100%",
  },
});

function MapComponent({
  openModal,
}: {
  openModal: ({ title, content }: { title: string; content: string }) => void;
}): JSX.Element {
  const classes = useStyles();

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
    const map = mapComponentRef.current;

    const featureRequest = new WFS().writeGetFeature({
      featureNS: "cgeo",
      featurePrefix: "CGEO",
      srsName: "EPSG:4326",
      outputFormat: "application/json",
      featureTypes: ["UF_2013"],
    });

    const xml = getXMLSerializer().serializeToString(featureRequest);

    fetch("https://geoservicos.ibge.gov.br/geoserver/ows", {
      method: "POST",
      body: xml,
    })
      .then((res) => res.json())
      .then((res) => {
        const features = new GeoJSON().readFeatures(res);

        const vectorSource = new VectorSource({
          features,
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            stroke: new Stroke({
              color: "blue",
              width: 2,
            }),
            zIndex: 10,
          }),
        });

        map.addLayer(vectorLayer);

        map.getView().fit(vectorSource.getExtent(), {
          padding: [50, 50, 50, 50],
        });

        map.on("click", (evt) => {
          const clickedFeatures = vectorSource.getFeaturesAtCoordinate(
            map.getCoordinateFromPixel(evt.pixel)
          );

          if (clickedFeatures.length === 1) {
            const properties = clickedFeatures[0].getProperties();

            if (properties && properties.uf) {
              axios
                .get(
                  `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${properties.uf}`
                )
                .then(({ data: ufData }) => {
                  const nameVariations = [ufData.sigla, ufData.nome];

                  const nameWithoutAccent = ufData.nome
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");

                  if (nameWithoutAccent !== nameVariations[1]) {
                    nameVariations.push(nameWithoutAccent);
                  }

                  Promise.all(
                    nameVariations.map((nameVariation) =>
                      axios.get("https://api.github.com/search/users", {
                        params: {
                          q: `type:user location:${nameVariation}`,
                          per_page: 1,
                        },
                      })
                    )
                  )
                    .then((gitResponses) => {
                      let usersTotal = 0;

                      gitResponses.forEach(({ data: gitData }) => {
                        usersTotal += gitData.total_count;
                      });

                      openModal({
                        title: ufData.nome,
                        content: `This state has a total of ${usersTotal} users on github`,
                      });
                    })
                    .catch((err) => {
                      if (
                        err.response &&
                        err.response.data.message.match(
                          /api rate limit exceeded/i
                        )
                      ) {
                        openModal({
                          title: "Api limit reached",
                          content:
                            "Sorry, your request limit for the github api has been reached, wait a while before making new attempts",
                        });
                      } else {
                        openModal({
                          title: "Something went wrong",
                          content:
                            "Sorry, there was a problem while requesting the GitHub api",
                        });
                      }
                    });
                })
                .catch(() => {
                  openModal({
                    title: "Something went wrong",
                    content:
                      "Sorry, there was a problem while requesting the IBGE api",
                  });
                });
            }
          }
        });
      });
  }, [openModal]);

  return <div ref={mapRef} className={classes.mapStyle} />;
}

export default MapComponent;
