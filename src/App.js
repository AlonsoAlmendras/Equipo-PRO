import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const INITIAL_VIEW_STATE = {
  longitude: -70.6693,
  latitude: -33.4489,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);
  }, []);

  const heatmapLayer = new HeatmapLayer({
    id: 'heatmap-layer',
    data,
    getPosition: d => [d.longitude, d.latitude],
    getWeight: d => d.count,
    radiusPixels: 60,
    intensity: 1,
    threshold: 0.05
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[heatmapLayer]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <Map
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle="mapbox://styles/mapbox/light-v10"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </DeckGL>
    </div>
  );
}
