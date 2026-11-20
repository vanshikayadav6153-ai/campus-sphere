import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import mapService from '../services/mapService';
import { createEmojiIcon } from '../components/MapPreview';
import {
  MapPin,
  ShieldCheck,
  Package,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';

// Subcomponent to control map viewport flying
function MapFlyController({ targetCoordinates, bounds }) {
  const map = useMap();

  useEffect(() => {
    if (targetCoordinates) {
      map.flyTo(targetCoordinates, 17, { duration: 1.2 });
    } else if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, targetCoordinates, bounds]);

  return null;
}

const MapPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Zone state
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneListings, setZoneListings] = useState({ items: [], skills: [] });
  const [listingsLoading, setListingsLoading] = useState(false);
  const [flyCoords, setFlyCoords] = useState(null);

  // Marker references to open popups programmatically
  const markerRefs = useRef({});

  useEffect(() => {
    const fetchZoneStats = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await mapService.getStats();
        const loadedZones = data.safeZones || [];
        setZones(loadedZones);

        // Default select the first zone if available
        if (loadedZones.length > 0) {
          handleSelectZone(loadedZones[0], false);
        }
      } catch (err) {
        console.error('Failed to load safe zone stats:', err);
        setError('Unable to load campus safe zones. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchZoneStats();
  }, []);

  // Fetch items & skills at the chosen safe zone
  const handleSelectZone = async (zone, shouldFly = true) => {
    setSelectedZone(zone);
    if (shouldFly && zone.coordinates) {
      setFlyCoords(zone.coordinates);
      // Open popup if marker is referenced
      if (markerRefs.current[zone._id]) {
        markerRefs.current[zone._id].openPopup();
      }
    }

    setListingsLoading(true);
    try {
      const data = await mapService.getZoneListings(zone._id);
      setZoneListings({
        items: data.items || [],
        skills: data.skills || [],
      });
    } catch (err) {
      console.error('Failed to load listings for zone:', err);
      setZoneListings({ items: [], skills: [] });
    } finally {
      setListingsLoading(false);
    }
  };

  // Compute map center and bounding box
  const { center, bounds } = useMemo(() => {
    if (!zones.length) {
      return { center: [28.6692, 77.4538], bounds: [] };
    }
    const validCoords = zones.filter((z) => z.coordinates?.length === 2).map((z) => z.coordinates);
    if (!validCoords.length) {
      return { center: [28.6692, 77.4538], bounds: [] };
    }

    const avgLat = validCoords.reduce((sum, c) => sum + c[0], 0) / validCoords.length;
    const avgLng = validCoords.reduce((sum, c) => sum + c[1], 0) / validCoords.length;

    return {
      center: [avgLat, avgLng],
      bounds: validCoords,
    };
  }, [zones]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Header Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-teal/10 text-campus-teal text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Trust Campus Security
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Campus Safe-Handover Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Verified physical handover checkpoints. Every marketplace gear exchange and in-person skill session happens in these guarded zones.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>5 Active Campus Safe Zones</span>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-campus-teal border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Initializing campus spatial map...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-center">
            <p className="font-bold text-sm mb-1">Map Initialization Notice</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {/* Map & Side Panel Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[550px]">
            {/* Interactive Leaflet Map Container */}
            <div className="lg:col-span-7 xl:col-span-8 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[420px] lg:min-h-full h-[55vh] lg:h-[calc(100vh-14rem)]">
              <MapContainer
                center={center}
                zoom={17}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapFlyController targetCoordinates={flyCoords} bounds={bounds} />

                {zones.map((zone) => {
                  if (!zone.coordinates || zone.coordinates.length < 2) return null;
                  const [lat, lng] = zone.coordinates;
                  const icon = createEmojiIcon(zone.icon || '📍');

                  return (
                    <Marker
                      key={zone._id}
                      position={[lat, lng]}
                      icon={icon}
                      ref={(ref) => {
                        if (ref) markerRefs.current[zone._id] = ref;
                      }}
                      eventHandlers={{
                        click: () => handleSelectZone(zone, false),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-1 max-w-[220px]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-lg">{zone.icon || '📍'}</span>
                            <h4 className="font-black text-slate-900 text-xs leading-tight">{zone.name}</h4>
                          </div>

                          <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                            {zone.safetyNote}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 mb-2">
                            <span>📦 {zone.availableItemsCount || 0} Items</span>
                            <span>⚡ {zone.openSkillsCount || 0} Skills</span>
                          </div>

                          <button
                            onClick={() => handleSelectZone(zone, true)}
                            className="w-full py-1.5 bg-campus-primary text-white text-[10px] font-bold rounded-lg hover:bg-campus-teal transition"
                          >
                            View listings here
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Side Panel / Bottom Sheet */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
              {/* Zones Selector List */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center justify-between">
                  <span>Campus Safe Zones</span>
                  <span className="text-[11px] font-semibold text-slate-400">Click to Fly</span>
                </h3>

                <div className="space-y-2">
                  {zones.map((zone) => {
                    const isSelected = selectedZone?._id === zone._id;
                    return (
                      <button
                        key={zone._id}
                        onClick={() => handleSelectZone(zone, true)}
                        className={`w-full text-left p-3 rounded-2xl transition border flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-campus-primary text-white border-campus-primary shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/70 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-xl shrink-0">{zone.icon || '📍'}</span>
                          <div className="truncate">
                            <p className="font-bold text-xs truncate">{zone.name}</p>
                            <p
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-slate-200' : 'text-slate-500'
                              }`}
                            >
                              {zone.safetyNote}
                            </p>
                          </div>
                        </div>

                        {/* Counts Badge */}
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 ml-2 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span>{zone.availableItemsCount || 0} 📦</span>
                          <span>{zone.openSkillsCount || 0} ⚡</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Zone Listings Details */}
              {selectedZone && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex-1 flex flex-col">
                  {/* Zone Header with Google Maps Link */}
                  <div className="pb-4 border-b border-slate-100 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{selectedZone.icon || '📍'}</span>
                        <h3 className="font-black text-sm text-slate-900">{selectedZone.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {selectedZone.description}
                      </p>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedZone.coordinates[0]},${selectedZone.coordinates[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-campus-primary text-xs font-bold transition shrink-0"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Listings Section */}
                  <div className="mt-4 space-y-4 flex-1">
                    {listingsLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-campus-teal border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-[11px] text-slate-500">Loading listings for this spot...</p>
                      </div>
                    ) : (
                      <>
                        {/* Open Skills at this spot */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-campus-teal" />
                              Skill Mentors at this Zone ({zoneListings.skills.length})
                            </span>
                          </div>

                          {zoneListings.skills.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
                              No active in-person skill offers at this location yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {zoneListings.skills.map((s) => (
                                <Link
                                  key={s._id}
                                  to={`/skills/${s._id}`}
                                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between transition group"
                                >
                                  <div className="truncate">
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-campus-primary truncate">
                                      {s.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      By {s.owner?.name} · {s.creditsPerHour} credits/hr
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Available Items at this spot */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                            <span className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-campus-primary" />
                              Gear & Utilities Available ({zoneListings.items.length})
                            </span>
                          </div>

                          {zoneListings.items.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
                              No marketplace gear posted for pickup at this zone yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {zoneListings.items.map((item) => (
                                <Link
                                  key={item._id}
                                  to={`/marketplace/${item._id}`}
                                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between transition group"
                                >
                                  <div className="truncate">
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-campus-primary truncate">
                                      {item.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {item.type === 'rent'
                                        ? `₹${item.rentPerDay}/day rent`
                                        : `₹${item.price} buy`} · By {item.owner?.name}
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MapPage;
