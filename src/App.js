import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';

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
  const [mode, setMode] = useState('heatmap');
  const [tooltipInfo, setTooltipInfo] = useState(null);

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
    getWeight: d => d.evasiones,
    radiusPixels: 60,
    intensity: 1,
    threshold: 0.05
  });

    const scatterLayer = new ScatterplotLayer({
    id: 'scatter-layer',
    data,
    getPosition: d => [d.longitude, d.latitude],
    getRadius: 20,
    radiusUnits: 'pixels',
    getFillColor: d => {
      const total = d.pagos + d.evasiones;
      const evasionRate = d.evasiones / total;
      const r = Math.floor(255 * evasionRate);
      const g = Math.floor(255 * (1 - evasionRate));
      return [r, g, 0, 200];
    },
    pickable: true,
    onClick: ({ object, x, y }) => {
      const { pagos, evasiones } = object;
      const total = pagos + evasiones;
      const porcentajePago = ((object.pagos / total) * 100).toFixed(1);
        setTooltipInfo({
          x,
          y,
          pagos: object.pagos,
          evasiones: object.evasiones,
          porcentaje: porcentajePago
        });
    }
  });


  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>

      <button
        onClick={() => {
          setMode(mode === 'heatmap' ? 'puntos' : 'heatmap');
          setTooltipInfo(null); // ocultar tooltip si se cambia de modo
        }}
        style={{
          position: 'absolute',
          zIndex: 10,
          margin: '10px',
          padding: '10px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          cursor: 'pointer'
        }}
      >
        Cambiar a {mode === 'heatmap' ? 'Puntos' : 'Heatmap'}
      </button>

       {tooltipInfo && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: tooltipInfo.x,
            top: tooltipInfo.y,
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '6px',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            fontSize: '14px',
            minWidth: '150px'
          }}
        >
          <div><strong>📍 Punto seleccionado</strong></div>
          <div>Pagos: {tooltipInfo.pagos}</div>
          <div>Evasiones: {tooltipInfo.evasiones}</div>
          <div>Pago: {tooltipInfo.porcentaje}%</div>
        </div>
      )}


      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={mode === 'heatmap' ? [heatmapLayer] : [scatterLayer]}
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
