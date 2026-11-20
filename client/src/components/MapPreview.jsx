import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, ShieldCheck, MapPin } from 'lucide-react';

export const createEmojiIcon = (emoji = '📍') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: #005F73;
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 18px; line-height: 1;">${emoji}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

const MapPreview = ({ zone, height = '200px' }) => {
  if (!zone || !zone.coordinates || zone.coordinates.length < 2) {
    return null;
  }

  const [lat, lng] = zone.coordinates;
  const icon = useMemo(() => createEmojiIcon(zone.icon || '📍'), [zone.icon]);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
      <div style={{ height, width: '100%' }} className="relative z-0">
        <MapContainer
          center={[lat, lng]}
          zoom={17}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          zoomControl={false}
          touchZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={icon}>
            <Popup>
              <div className="text-xs font-sans">
                <p className="font-bold text-slate-900">{zone.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{zone.safetyNote}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Zone Info Footer with Google Maps Link */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="text-base">{zone.icon || '📍'}</span>
          <div className="truncate">
            <p className="font-bold text-slate-800 truncate">{zone.name}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{zone.safetyNote || 'Guarded Safe Zone'}</span>
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-campus-primary text-[11px] font-bold transition shrink-0 ml-2"
        >
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default MapPreview;
