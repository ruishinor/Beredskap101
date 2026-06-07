import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import sheltersData from '../data/shelters.json';
import { Compass, Search, MapPin, Navigation, AlertTriangle, ExternalLink, Layers } from 'lucide-react';
import type { ThemeType } from '../types';
import {
  getFallbackProviderState,
  markShelterMapProviderFailure,
  resolveShelterMapProviderState,
  type ShelterMapProviderState,
} from './shelter-map/mapProvider';

interface Shelter {
  romnr: string;
  plasser: number;
  adresse: string;
  lat: number;
  lng: number;
}

interface ShelterMapProps {
  currentLang: string;
  theme: ThemeType;
}

type LeafletShelterMarker = {
  shelter: Shelter;
  marker: L.Marker;
};

type MapLibreShelterMarker = {
  shelter: Shelter;
  marker: maplibregl.Marker;
};

type LeafletBasemapId = 'offline-grid' | 'openstreetmap-standard';
type MapLayerMode = 'street' | 'offline-package' | 'offline-grid';

const MAP_LAYER_STORAGE_KEY = 'beredskap101.shelterMap.layerMode.v1';
const MAPLIBRE_ROUTE_SOURCE_ID = 'shelter-user-route';
const MAPLIBRE_ROUTE_LAYER_ID = 'shelter-user-route-layer';
const MAPLIBRE_FUTURE_POI_SOURCE_ID = 'future-poi-overlay';
const MAPLIBRE_FUTURE_POI_LAYER_ID = 'future-poi-overlay-layer';
const MAPLIBRE_UNDERLAY_SOURCE_ID = 'shelter-map-underlay-source';
const MAPLIBRE_UNDERLAY_LAYER_ID = 'shelter-map-underlay-layer';
const SHELTER_SOURCE_DATA_URL = 'https://objektkatalog.geonorge.no/Pakke/Index/EAPK_7EE76361_FFA5_4bc5_974E_40DBDE875EE5';
const SHELTER_SOURCE_GUIDANCE_URL = 'https://www.dsb.no/sikkerhverdag/egenberedskap/verdt-a-vite-om-tilfluktsrom/';
const LEAFLET_BASEMAP_CANDIDATES: Array<{
  id: Exclude<LeafletBasemapId, 'offline-grid'>;
  layerMode: Extract<MapLayerMode, 'street'>;
  url: string;
  attribution: string;
  maxZoom: number;
}> = [
  {
    id: 'openstreetmap-standard',
    layerMode: 'street',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  },
];

function getLeafletBasemapLabel(basemapId: LeafletBasemapId, currentLang: string): string {
  if (basemapId === 'openstreetmap-standard') {
    return currentLang === 'no'
      ? 'Gatekart aktivt'
      : 'Street map active';
  }

  return currentLang === 'no'
    ? 'Offline kartbakgrunn'
    : 'Offline map background';
}

function getMapLayerLabel(mode: MapLayerMode, currentLang: string): string {
  if (mode === 'street') {
    return currentLang === 'no' ? 'Gatekart' : 'Street';
  }
  if (mode === 'offline-package') {
    return currentLang === 'no' ? 'Offline-pakke' : 'Offline package';
  }
  return currentLang === 'no' ? 'Enkel reserve' : 'Simple fallback';
}

function getMapPackageStatusLabel(
  providerState: ShelterMapProviderState,
  currentLang: string
): string {
  if (providerState.packageStatus === 'installed') {
    return currentLang === 'no' ? 'Offline-pakke klar' : 'Offline package ready';
  }
  if (providerState.packageStatus === 'stale') {
    return currentLang === 'no' ? 'Offline-pakke utdatert' : 'Offline package stale';
  }
  if (providerState.packageStatus === 'failed-to-load') {
    return currentLang === 'no' ? 'Offline-pakke feilet' : 'Offline package failed';
  }

  return currentLang === 'no' ? 'Offline-pakke utilgjengelig' : 'Offline package unavailable';
}

function getMapPackageModeLabel(
  providerState: ShelterMapProviderState,
  currentLang: string
): string {
  if (providerState.packageMode === 'local-public-file') {
    return currentLang === 'no' ? 'Innebygd lokal fil' : 'Bundled local file';
  }
  if (providerState.packageMode === 'cached-download') {
    return currentLang === 'no' ? 'Bufret nedlasting' : 'Cached download';
  }

  return currentLang === 'no' ? 'Reservebakgrunn' : 'Reserve background';
}

function getRequestedLeafletCandidateOrder(
  mode: MapLayerMode
): Array<(typeof LEAFLET_BASEMAP_CANDIDATES)[number]> {
  if (mode === 'offline-grid') return [];
  return [LEAFLET_BASEMAP_CANDIDATES.find((candidate) => candidate.id === 'openstreetmap-standard')].filter(Boolean) as Array<(typeof LEAFLET_BASEMAP_CANDIDATES)[number]>;
}

function isMapLayerMode(value: unknown): value is MapLayerMode {
  return value === 'street' || value === 'offline-package' || value === 'offline-grid';
}

function getDefaultMapLayerMode(): MapLayerMode {
  if (typeof navigator === 'undefined') return 'street';
  return navigator.onLine ? 'street' : 'offline-grid';
}

function readPersistedMapLayerMode(): MapLayerMode {
  if (typeof window === 'undefined') return getDefaultMapLayerMode();

  try {
    const stored = window.localStorage.getItem(MAP_LAYER_STORAGE_KEY);
    if (stored === 'topographic') {
      return 'street';
    }
    if (isMapLayerMode(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage read failures and fall back to current connectivity state.
  }

  return getDefaultMapLayerMode();
}
function buildShelterPopupContent(shelter: Shelter, theme: ThemeType, currentLang: string): string {
  const capacityLabel = currentLang === 'no' ? 'Kapasitet' : 'Capacity';
  const roomLabel = currentLang === 'no' ? 'Romnummer' : 'Shelter ID';
  const addressLabel = currentLang === 'no' ? 'Hentet adresse' : 'Retrieved address';

  return `
    <div style="font-family: sans-serif; padding: 4px; color: ${theme !== 'light' ? '#fff' : '#111'};">
      <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; line-height: 1.2;">
        ${shelter.adresse}
      </h4>
      <p style="margin: 0 0 4px 0; font-size: 11px;">
        <strong>${addressLabel}:</strong> ${shelter.adresse}
      </p>
      <p style="margin: 0 0 4px 0; font-size: 11px;">
        <strong>${capacityLabel}:</strong> ${shelter.plasser} ${currentLang === 'no' ? 'plasser' : 'spaces'}
      </p>
      <p style="margin: 0; font-size: 11px;">
        <strong>${roomLabel}:</strong> ${shelter.romnr}
      </p>
    </div>`;
}

function buildOpenStreetMapUrl(shelter: Shelter): string {
  const marker = `${shelter.lat},${shelter.lng}`;
  return `https://www.openstreetmap.org/?mlat=${shelter.lat}&mlon=${shelter.lng}#map=17/${marker}`;
}

function isPhoneDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const looksMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const coarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;

  return looksMobile || coarsePointer;
}

function buildNativeMapUrl(shelter: Shelter): string {
  const latLng = `${shelter.lat},${shelter.lng}`;
  const label = encodeURIComponent(shelter.adresse);

  if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent || '')) {
    return `https://maps.apple.com/?ll=${latLng}&q=${label}`;
  }

  return `geo:${latLng}?q=${encodeURIComponent(`${latLng} (${shelter.adresse})`)}`;
}

export default function ShelterMap({ currentLang, theme }: ShelterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<LeafletShelterMarker[]>([]);
  const leafletUserMarkerRef = useRef<L.Marker | null>(null);
  const leafletUserRouteRef = useRef<L.Polyline | null>(null);

  const mapLibreMapRef = useRef<maplibregl.Map | null>(null);
  const mapLibreMarkersRef = useRef<MapLibreShelterMarker[]>([]);
  const mapLibreUserMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLayerNotice, setMapLayerNotice] = useState<string | null>(null);
  const [providerState, setProviderState] = useState<ShelterMapProviderState>(getFallbackProviderState());
  const [leafletBasemapId, setLeafletBasemapId] = useState<LeafletBasemapId>('offline-grid');
  const [mapLayerMode, setMapLayerMode] = useState<MapLayerMode>(() => readPersistedMapLayerMode());
  const phoneDevice = useMemo(() => isPhoneDevice(), []);

  useEffect(() => {
    let cancelled = false;

    resolveShelterMapProviderState().then((resolved) => {
      if (!cancelled) {
        setProviderState(resolved);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(MAP_LAYER_STORAGE_KEY, mapLayerMode);
    } catch {
      // Ignore storage write failures.
    }
  }, [mapLayerMode]);

  useEffect(() => {
    if (mapLayerMode !== 'offline-package') return;
    if (providerState.config) return;
    setMapLayerNotice(
      currentLang === 'no'
        ? 'Den innebygde offline-pakken er ikke tilgjengelig i denne kopien. Appen bruker reservebakgrunn i stedet.'
        : 'The bundled offline package is unavailable in this copy. The app is using the reserve background instead.'
    );
    setMapLayerMode(getDefaultMapLayerMode());
  }, [currentLang, mapLayerMode, providerState.config]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
  };

  const getDistanceString = (shelter: Shelter) => {
    if (!userCoords) return null;
    const dist = calculateDistance(userCoords.lat, userCoords.lng, shelter.lat, shelter.lng);
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
  };

  const processedShelters = useMemo(() => {
    let items = sheltersData as Shelter[];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      items = items.filter((shelter) =>
        shelter.adresse.toLowerCase().includes(q) || shelter.romnr.toLowerCase().includes(q)
      );
    }

    if (userCoords) {
      items = [...items].sort((a, b) => {
        const distA = calculateDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return items;
  }, [searchQuery, userCoords]);

  const clearAllMaps = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    if (mapLibreMapRef.current) {
      mapLibreMapRef.current.remove();
      mapLibreMapRef.current = null;
    }

    leafletMarkersRef.current = [];
    leafletUserMarkerRef.current = null;
    leafletUserRouteRef.current = null;
    mapLibreMarkersRef.current = [];
    mapLibreUserMarkerRef.current = null;
  };

  const ensureMapLibreFuturePoiLayer = (map: maplibregl.Map) => {
    if (!map.getSource(MAPLIBRE_FUTURE_POI_SOURCE_ID)) {
      map.addSource(MAPLIBRE_FUTURE_POI_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    }

    if (!map.getLayer(MAPLIBRE_FUTURE_POI_LAYER_ID)) {
      map.addLayer({
        id: MAPLIBRE_FUTURE_POI_LAYER_ID,
        type: 'circle',
        source: MAPLIBRE_FUTURE_POI_SOURCE_ID,
        paint: {
          'circle-radius': 5,
          'circle-color': theme !== 'light' ? '#8fd3c7' : '#225c52',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.85,
        },
      });
    }
  };

  const drawMapLibreRoute = (map: maplibregl.Map, shelter: Shelter, coords: { lat: number; lng: number }) => {
    if (!map.isStyleLoaded()) {
      map.once('load', () => drawMapLibreRoute(map, shelter, coords));
      return;
    }

    const routeGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [coords.lng, coords.lat],
              [shelter.lng, shelter.lat],
            ],
          },
        },
      ],
    } as any;

    const existingSource = map.getSource(MAPLIBRE_ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(routeGeoJson);
      return;
    }

    map.addSource(MAPLIBRE_ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: routeGeoJson,
    });

    map.addLayer({
      id: MAPLIBRE_ROUTE_LAYER_ID,
      type: 'line',
      source: MAPLIBRE_ROUTE_SOURCE_ID,
      paint: {
        'line-color': theme !== 'light' ? '#8fd3c7' : '#225c52',
        'line-width': 3,
        'line-opacity': 0.85,
        'line-dasharray': [2, 2],
      },
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    clearAllMaps();

    const initialCenterLeaflet: L.LatLngExpression = userCoords ? [userCoords.lat, userCoords.lng] : [62.0, 10.0];
    const initialCenterMapLibre: [number, number] = userCoords ? [userCoords.lng, userCoords.lat] : [10.0, 62.0];
    const initialZoom = userCoords ? 13 : 5;
    const requestedLeafletCandidates = getRequestedLeafletCandidateOrder(mapLayerMode);
    const shouldAttemptPmtiles =
      mapLayerMode === 'offline-package' &&
      providerState.activeProvider === 'pmtiles-vector-map' &&
      Boolean(providerState.config);

    if (shouldAttemptPmtiles && providerState.config) {
      const protocol = new Protocol();
      let mapLoadTimeout = 0;
      let loadSettled = false;
      let failureHandled = false;

      const handleProviderFailure = (reason: string) => {
        if (failureHandled) return;
        failureHandled = true;
        setProviderState((prev) => {
          if (prev.packageStatus === 'failed-to-load') return prev;
          return markShelterMapProviderFailure(prev, reason);
        });
      };

      try {
        maplibregl.addProtocol('pmtiles', protocol.tile);

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: providerState.config.styleUrl,
          center: initialCenterMapLibre,
          zoom: initialZoom,
          minZoom: 4,
          maxZoom: 18,
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

        map.on('load', () => {
          loadSettled = true;
          if (mapLoadTimeout) {
            window.clearTimeout(mapLoadTimeout);
            mapLoadTimeout = 0;
          }

          mapLibreMapRef.current = map;
          mapLibreMarkersRef.current = [];
          mapLibreUserMarkerRef.current = null;
          const underlayCandidate = requestedLeafletCandidates[0];
          setLeafletBasemapId(underlayCandidate?.id ?? 'offline-grid');

          if (underlayCandidate && !map.getSource(MAPLIBRE_UNDERLAY_SOURCE_ID)) {
            map.addSource(MAPLIBRE_UNDERLAY_SOURCE_ID, {
              type: 'raster',
              tiles: [underlayCandidate.url],
              tileSize: 256,
              attribution: underlayCandidate.attribution,
            });
            const firstLayerId = map.getStyle().layers?.[0]?.id;
            map.addLayer(
              {
                id: MAPLIBRE_UNDERLAY_LAYER_ID,
                type: 'raster',
                source: MAPLIBRE_UNDERLAY_SOURCE_ID,
                paint: {
                  'raster-opacity': 1,
                },
              },
              firstLayerId
            );
          }

          ensureMapLibreFuturePoiLayer(map);

          processedShelters.forEach((shelter) => {
            const markerElement = document.createElement('div');
            markerElement.className = 'maplibre-shelter-marker';
            markerElement.style.backgroundColor = theme !== 'light' ? '#8fd3c7' : '#225c52';
            markerElement.style.width = '12px';
            markerElement.style.height = '12px';
            markerElement.style.borderRadius = '9999px';
            markerElement.style.border = '2px solid white';
            markerElement.style.boxShadow = '0 0 6px rgba(0,0,0,0.4)';
            markerElement.style.cursor = 'pointer';

            const popup = new maplibregl.Popup({
              closeButton: false,
              maxWidth: '260px',
              className: theme !== 'light' ? 'dark-maplibre-popup' : 'light-maplibre-popup',
              offset: 14,
            }).setHTML(buildShelterPopupContent(shelter, theme, currentLang));

            const marker = new maplibregl.Marker({ element: markerElement, anchor: 'center' })
              .setLngLat([shelter.lng, shelter.lat])
              .setPopup(popup)
              .addTo(map);

            markerElement.addEventListener('click', () => {
              setSelectedShelter(shelter);
            });

            mapLibreMarkersRef.current.push({ shelter, marker });
          });

          if (userCoords) {
            const userMarkerEl = document.createElement('div');
            userMarkerEl.className = 'maplibre-user-marker';
            userMarkerEl.innerHTML = `
              <div style="position: relative; width: 16px; height: 16px;">
                <div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(37,99,235,0.6); z-index: 10;"></div>
                <div style="position: absolute; top: -4px; left: -4px; width: 24px; height: 24px; border-radius: 50%; background-color: #2563eb; opacity: 0.3; animation: pulse 2s infinite;"></div>
              </div>
            `;

            const userPopup = new maplibregl.Popup({ closeButton: false, offset: 10 }).setHTML(
              `<div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: ${theme !== 'light' ? '#fff' : '#111'};">${currentLang === 'no' ? 'Din posisjon' : 'Your position'}</div>`
            );

            mapLibreUserMarkerRef.current = new maplibregl.Marker({ element: userMarkerEl, anchor: 'center' })
              .setLngLat([userCoords.lng, userCoords.lat])
              .setPopup(userPopup)
              .addTo(map);
          }
        });

        map.on('error', (event) => {
          const reason = event?.error instanceof Error ? event.error.message : 'Unknown PMTiles load error';
          if (!loadSettled) {
            handleProviderFailure(reason);
          } else {
            console.error('PMTiles map runtime warning:', reason);
          }
        });

        mapLoadTimeout = window.setTimeout(() => {
          if (!loadSettled) {
            handleProviderFailure('PMTiles package timed out while loading');
          }
        }, 12000);

        return () => {
          if (mapLoadTimeout) {
            window.clearTimeout(mapLoadTimeout);
          }
          if (mapLibreMapRef.current) {
            mapLibreMapRef.current.remove();
            mapLibreMapRef.current = null;
          }
          mapLibreMarkersRef.current = [];
          mapLibreUserMarkerRef.current = null;
          try {
            maplibregl.removeProtocol('pmtiles');
          } catch {
            // no-op
          }
        };
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'PMTiles initialization failed';
        setProviderState((prev) => markShelterMapProviderFailure(prev, reason));
        try {
          maplibregl.removeProtocol('pmtiles');
        } catch {
          // no-op
        }
      }
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 18,
    }).setView(initialCenterLeaflet, initialZoom);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.attributionControl.setPrefix(currentLang === 'no' ? 'Kartbakgrunn' : 'Basemap');
    leafletMapRef.current = map;

    leafletMarkersRef.current = [];
    leafletUserMarkerRef.current = null;
    leafletUserRouteRef.current = null;
    setLeafletBasemapId('offline-grid');

    let activeBasemapLayer: L.TileLayer | null = null;
    const tryAttachLeafletBasemap = (candidateIndex: number) => {
      if (candidateIndex >= requestedLeafletCandidates.length || mapLayerMode === 'offline-grid') {
        setLeafletBasemapId('offline-grid');
        return;
      }

      const candidate = requestedLeafletCandidates[candidateIndex];
      const tileLayer = L.tileLayer(candidate.url, {
        attribution: candidate.attribution,
        maxZoom: candidate.maxZoom,
      });

      let settled = false;
      let tileErrorCount = 0;

      const cleanup = () => {
        tileLayer.off('load', handleLoad);
        tileLayer.off('tileerror', handleTileError);
      };

      const handleLoad = () => {
        if (settled) return;
        settled = true;
        cleanup();
        setLeafletBasemapId(candidate.id);
      };

      const handleTileError = () => {
        if (settled) return;
        tileErrorCount += 1;
        if (tileErrorCount < 2) return;
        settled = true;
        cleanup();
        map.removeLayer(tileLayer);
        activeBasemapLayer = null;
        tryAttachLeafletBasemap(candidateIndex + 1);
      };

      activeBasemapLayer = tileLayer;
      tileLayer.on('load', handleLoad);
      tileLayer.on('tileerror', handleTileError);
      tileLayer.addTo(map);
    };

    if (mapLayerMode !== 'offline-grid' && (typeof navigator === 'undefined' || navigator.onLine)) {
      tryAttachLeafletBasemap(0);
    }

    const defaultIcon = L.divIcon({
      className: 'custom-shelter-icon',
      html: `<div style="background-color: ${theme !== 'light' ? '#8fd3c7' : '#225c52'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    processedShelters.forEach((shelter) => {
      const marker = L.marker([shelter.lat, shelter.lng], { icon: defaultIcon })
        .addTo(map)
        .bindPopup(buildShelterPopupContent(shelter, theme, currentLang), {
          className: theme !== 'light' ? 'dark-popup' : 'light-popup',
          closeButton: false,
        });

      marker.on('click', () => {
        setSelectedShelter(shelter);
      });

      leafletMarkersRef.current.push({ shelter, marker });
    });

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `<div style="position: relative; width: 16px; height: 16px;"><div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(37,99,235,0.6); z-index: 10;"></div><div style="position: absolute; top: -4px; left: -4px; width: 24px; height: 24px; border-radius: 50%; background-color: #2563eb; opacity: 0.3; animation: pulse 2s infinite;"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      leafletUserMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: ${theme !== 'light' ? '#fff' : '#111'};">${currentLang === 'no' ? 'Din posisjon' : 'Your position'}</div>`
        );
    }

    return () => {
      if (activeBasemapLayer) {
        activeBasemapLayer.remove();
      }
      clearAllMaps();
    };
  }, [currentLang, mapLayerMode, processedShelters, providerState.activeProvider, providerState.config, theme, userCoords]);

  const handleSelectShelter = (shelter: Shelter) => {
    setSelectedShelter(shelter);

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([shelter.lat, shelter.lng], 16);
      const matched = leafletMarkersRef.current.find((entry) => entry.shelter.romnr === shelter.romnr);
      if (matched) {
        matched.marker.openPopup();
      }

      if (userCoords) {
        if (leafletUserRouteRef.current) {
          leafletMapRef.current.removeLayer(leafletUserRouteRef.current);
        }
        leafletUserRouteRef.current = L.polyline(
          [
            [userCoords.lat, userCoords.lng],
            [shelter.lat, shelter.lng],
          ],
          {
            color: theme !== 'light' ? '#8fd3c7' : '#225c52',
            weight: 3,
            opacity: 0.8,
            dashArray: '6, 6',
          }
        ).addTo(leafletMapRef.current);
      }
    }

    if (mapLibreMapRef.current) {
      mapLibreMapRef.current.easeTo({
        center: [shelter.lng, shelter.lat],
        zoom: 16,
        duration: 450,
      });

      const matched = mapLibreMarkersRef.current.find((entry) => entry.shelter.romnr === shelter.romnr);
      if (matched) {
        const popup = matched.marker.getPopup();
        if (popup) {
          popup.setLngLat([shelter.lng, shelter.lat]).addTo(mapLibreMapRef.current);
        }
      }

      if (userCoords) {
        drawMapLibreRoute(mapLibreMapRef.current, shelter, userCoords);
      }
    }
  };

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      alert(currentLang === 'no' ? 'Geolokasjon stottes ikke av din nettleser.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        let closest: Shelter | null = null;
        let minDistance = Infinity;

        sheltersData.forEach((shelter) => {
          const distance = calculateDistance(lat, lng, shelter.lat, shelter.lng);
          if (distance < minDistance) {
            minDistance = distance;
            closest = shelter as Shelter;
          }
        });

        if (closest) {
          window.setTimeout(() => {
            handleSelectShelter(closest as Shelter);
          }, 100);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error('Error fetching geolocation:', error);
        alert(
          currentLang === 'no'
            ? 'Kunne ikke hente din posisjon. Sjekk at du har gitt nettleseren tillatelse til lokasjonsdeling.'
            : 'Could not fetch your location. Please check your browser location sharing permissions.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMapLayerSelection = (mode: MapLayerMode) => {
    if (mode === 'offline-package' && !isPmtilesAvailable) {
      setMapLayerNotice(
        currentLang === 'no'
          ? 'Den innebygde offline-pakken er ikke tilgjengelig i denne kopien. Appen bruker reservebakgrunn i stedet.'
          : 'The bundled offline package is unavailable in this copy. The app is using the reserve background instead.'
      );
      return;
    }

    setMapLayerNotice(null);
    setMapLayerMode(mode);
  };

  const mapStatusLabel = getMapPackageStatusLabel(providerState, currentLang);
  const mapModeLabel = getMapPackageModeLabel(providerState, currentLang);
  const isPmtilesAvailable = Boolean(providerState.config);
  const isPmtilesRequested = mapLayerMode === 'offline-package' && isPmtilesAvailable;
  const isPmtilesActive = isPmtilesRequested && providerState.activeProvider === 'pmtiles-vector-map';
  const statusToneClass = providerState.packageStatus === 'failed-to-load'
    ? 'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]'
    : providerState.packageStatus === 'stale'
      ? 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]'
      : providerState.packageStatus === 'installed'
        ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]'
        : 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]';

  const mapOverlayLabel = isPmtilesActive
    ? currentLang === 'no'
      ? `Offline-pakke aktiv · ${getLeafletBasemapLabel(leafletBasemapId, currentLang)} rundt dekningen`
      : `Offline package active · ${getLeafletBasemapLabel(leafletBasemapId, currentLang)} outside coverage`
    : providerState.packageStatus === 'failed-to-load' && mapLayerMode === 'offline-package'
      ? currentLang === 'no'
        ? `PMTiles feilet, ${getLeafletBasemapLabel(leafletBasemapId, currentLang)}`
        : `PMTiles failed, ${getLeafletBasemapLabel(leafletBasemapId, currentLang)}`
      : getLeafletBasemapLabel(leafletBasemapId, currentLang);
  const mapAuthorityBadgeLabel = currentLang === 'no'
    ? 'Orientering, ikke ruting'
    : 'Orientation only, not routing';
  const mapAuthorityHelperText = currentLang === 'no'
    ? 'Den innebygde offline-pakken er kun for orientering. Bruk tilfluktsromlisten, romnummeret og offisielle kart eller lokal kjennskap før du beveger deg.'
    : 'The bundled offline package is for orientation only. Use the shelter list, shelter ID, and official maps or local knowledge before moving.';
  const mapLayerHelperText = mapLayerNotice || (currentLang === 'no'
    ? 'Gatekart er standard. Bytt til Offline-pakke for å beholde en innebygd orienteringsbakgrunn når nettet faller ut.'
    : 'Street is the default. Switch to Offline package to keep a bundled orientation basemap when the network drops.');
  const shouldShowOfflineCanvas =
    mapLayerMode === 'offline-grid' ||
    (leafletBasemapId === 'offline-grid' && typeof navigator !== 'undefined' && !navigator.onLine);
  const mapCanvasToneClass = isPmtilesActive
    ? 'pmtiles-shelter-basemap'
    : shouldShowOfflineCanvas
      ? 'offline-shelter-basemap'
      : 'live-shelter-basemap';
  const openStreetMapHref = selectedShelter ? buildOpenStreetMapUrl(selectedShelter) : null;
  const nativeMapHref = selectedShelter && phoneDevice ? buildNativeMapUrl(selectedShelter) : null;
  const nativeMapTarget = nativeMapHref?.startsWith('geo:') ? undefined : '_blank';
  const nativeMapRel = nativeMapHref?.startsWith('geo:') ? undefined : 'noreferrer';

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--accent)] uppercase px-2 py-0.5 rounded border border-[var(--border-muted)] bg-black/25 w-fit block mb-1">
            {currentLang === 'no' ? 'Offentlige Beskyttelsesrom' : 'Public Protection Shelters'}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
            {currentLang === 'no' ? 'Norske Tilfluktsrom' : 'Norwegian Shelters'}
          </h2>
          <p className="text-[12px] text-[var(--text-muted)] mt-1 max-w-[70ch] leading-relaxed">
            {currentLang === 'no'
              ? 'Dette kartet viser samtlige 556 registrerte offentlige tilfluktsrom i Norge. Private tilfluktsrom er ment for tilknyttede bygg og er ikke frigitt i det offentlige datasettet fra DSB.'
              : 'This map displays all 556 registered public emergency shelters in Norway. Private shelters are meant for specific buildings and are not included in DSB public open dataset.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wide">
            <span className="rounded-full border border-green-500/30 bg-green-950/20 px-3 py-1 text-green-400">
              {currentLang === 'no' ? 'Tilfluktsromdata offline-klar' : 'Shelter data offline-ready'}
            </span>
            <span className={`rounded-full px-3 py-1 ${statusToneClass}`}>
              {mapStatusLabel}
            </span>
            <span className="rounded-full border border-blue-500/25 bg-blue-950/20 px-3 py-1 text-blue-300">
              {mapModeLabel}
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-950/20 px-3 py-1 text-amber-300">
              {mapAuthorityBadgeLabel}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-[var(--text-dim)] max-w-[70ch] leading-relaxed">
            {currentLang === 'no'
              ? 'For de fleste brukere fungerer kartet automatisk på nett. Denne appen leveres også med en innebygd offline-pakke som kan holde kartbakgrunnen synlig hvis internett faller ut.'
              : 'For most people the map works automatically while online. This app also ships with a bundled offline package that can keep the map background visible if internet access drops.'}
          </p>
          <div className="mt-3 inline-flex max-w-[72ch] items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-950/15 px-3 py-2 text-[11px] leading-relaxed text-amber-200/95">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{mapAuthorityHelperText}</span>
          </div>
          {providerState.config?.packageId && (
            <p className="mt-2 text-[10px] font-mono uppercase tracking-wide text-[var(--text-dim)]">
              {currentLang === 'no' ? 'Kartpakke-ID' : 'Map package ID'}: {providerState.config.packageId}
            </p>
          )}
          {providerState.packageStatus === 'failed-to-load' && providerState.statusReason && (
            <p className="mt-1 text-[10px] font-mono text-red-300/90">
              {providerState.statusReason}
            </p>
          )}
        </div>

        <button
          onClick={handleFindNearest}
          disabled={isLocating}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase font-mono tracking-wider transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-60 bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-110 active:scale-98"
          style={{
            boxShadow: '0 4px 14px rgba(143, 211, 199, 0.22)',
            color: 'var(--accent-on-solid)',
          }}
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>
            {isLocating
              ? (currentLang === 'no' ? 'Søker posisjon...' : 'Locating...')
              : (currentLang === 'no' ? 'Finn nærmeste tilfluktsrom' : 'Find nearest shelter')}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[600px]">
        <div className="lg:col-span-4 flex flex-col gap-4 bg-[var(--bg-panel)] border border-[var(--border-muted)] rounded-[var(--radius-lg)] p-4 shadow-md max-h-[600px] overflow-hidden">
          <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--bg-alt)]/70 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wide text-[var(--text-main)]">
                {currentLang === 'no' ? 'Kartlag' : 'Map layer'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={currentLang === 'no' ? 'Velg kartlag' : 'Choose map layer'}>
              {(['street', 'offline-package', 'offline-grid'] as MapLayerMode[]).map((mode) => {
                const active = mapLayerMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleMapLayerSelection(mode)}
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] border-transparent'
                        : mode === 'offline-package' && !isPmtilesAvailable
                          ? 'bg-[var(--bg-panel)] text-[var(--text-dim)] border-[var(--border-muted)] hover:border-yellow-500/40 hover:text-yellow-200'
                          : 'bg-[var(--bg-panel)] text-[var(--text-dim)] border-[var(--border-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text-main)]'
                    }`}
                  >
                    {getMapLayerLabel(mode, currentLang)}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-dim)] leading-relaxed">
              {mapLayerHelperText}
            </p>
            <p className="mt-2 text-[11px] text-amber-200/95 leading-relaxed">
              {mapAuthorityHelperText}
            </p>
          </div>

          <div className="relative bg-black/25 border border-[var(--border-muted)] rounded-lg px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder={currentLang === 'no' ? 'Søk etter gate eller romnr...' : 'Search street or shelter ID...'}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--text-main)] placeholder:text-[var(--text-dim)] w-full focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] font-mono hover:text-[var(--accent-on-solid)] text-[var(--text-dim)]"
              >
                CLEAR
              </button>
            )}
          </div>

          {userCoords && (
            <div className="flex items-center gap-2 p-2 bg-blue-950/20 border border-blue-500/20 rounded-md text-[10px] font-mono text-blue-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'no'
                  ? `Posisjon: ${userCoords.lat.toFixed(4)}N, ${userCoords.lng.toFixed(4)}E (Nærmeste sortert først)`
                  : `Position: ${userCoords.lat.toFixed(4)}N, ${userCoords.lng.toFixed(4)}E (Nearest sorted first)`}
              </span>
            </div>
          )}

          <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {processedShelters.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-dim)] font-mono text-xs">
                {currentLang === 'no' ? 'Ingen tilfluktsrom funnet' : 'No shelters match search'}
              </div>
            ) : (
              processedShelters.map((shelter) => {
                const isSelected = selectedShelter?.romnr === shelter.romnr;
                const distance = getDistanceString(shelter);

                return (
                  <div
                    key={shelter.romnr}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectShelter(shelter)}
                    onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelectShelter(shelter);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-[var(--accent-solid)]/10 border-[var(--accent)] text-[var(--text-main)]'
                        : 'bg-black/10 border-[var(--border-muted)] hover:border-[var(--text-dim)]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-[12px] leading-tight text-[var(--text-main)] line-clamp-1">
                        {shelter.adresse}
                      </h4>
                      {distance && (
                        <span className="text-[10px] font-mono font-bold text-[var(--accent)] bg-[var(--accent-solid)]/10 px-1.5 py-0.5 rounded flex-shrink-0">
                          {distance}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2 text-[10px] text-[var(--text-dim)] font-mono">
                      <span>Rom: #{shelter.romnr}</span>
                      <span className="font-semibold text-[var(--text-main)]">
                        {shelter.plasser} {currentLang === 'no' ? 'plasser' : 'spaces'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-[var(--border-muted)] flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono text-[var(--text-dim)]">
            <span>{currentLang === 'no' ? 'Kilde: DSB / Geonorge' : 'Source: DSB / Geonorge'}</span>
            <a
              href={SHELTER_SOURCE_DATA_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={currentLang === 'no' ? 'Åpne kildemateriale for tilfluktsromdata' : 'Open source material for shelter data'}
              className="inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{currentLang === 'no' ? 'Kilde' : 'Source'}</span>
            </a>
            <span>{processedShelters.length} / 556</span>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col bg-[var(--bg-panel)] border border-[var(--border-muted)] rounded-[var(--radius-lg)] overflow-hidden shadow-md relative min-h-[450px]">
          <div
            ref={mapContainerRef}
            className={`${mapCanvasToneClass} w-full flex-grow relative z-10 min-h-[400px]`}
            id="shelter-map-canvas"
          />
          <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-full border border-yellow-500/30 bg-black/60 px-3 py-1 text-[10px] font-mono uppercase tracking-wide text-yellow-300 backdrop-blur">
            {mapOverlayLabel}
          </div>

          <style>{`
            #shelter-map-canvas,
            #shelter-map-canvas.leaflet-container,
            #shelter-map-canvas.maplibregl-map {
              background-color: var(--bg-panel);
            }
            #shelter-map-canvas.live-shelter-basemap,
            #shelter-map-canvas.live-shelter-basemap.leaflet-container,
            #shelter-map-canvas.pmtiles-shelter-basemap,
            #shelter-map-canvas.pmtiles-shelter-basemap.maplibregl-map {
              background:
                linear-gradient(180deg, rgba(208, 231, 245, 0.95) 0%, rgba(177, 213, 233, 0.95) 100%);
            }
            #shelter-map-canvas.offline-shelter-basemap,
            #shelter-map-canvas.offline-shelter-basemap.leaflet-container {
              background-image:
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                radial-gradient(circle at 30% 20%, rgba(143, 211, 199, 0.16), transparent 24%),
                radial-gradient(circle at 70% 75%, rgba(46, 125, 50, 0.14), transparent 28%);
              background-size: 44px 44px, 44px 44px, 100% 100%, 100% 100%;
            }
            #shelter-map-canvas.offline-shelter-basemap::before {
              content: "${currentLang === 'no' ? 'Basiskart utilgjengelig offline' : 'Basemap unavailable offline'}";
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              z-index: 1;
              color: var(--text-dim);
              font: 700 11px var(--font-mono);
              letter-spacing: 0.08em;
              text-transform: uppercase;
              opacity: 0.55;
              pointer-events: none;
              white-space: nowrap;
            }
            .leaflet-bar,
            .maplibregl-ctrl-group {
              border: 1px solid var(--border-muted) !important;
              box-shadow: none !important;
            }
            .leaflet-bar a,
            .maplibregl-ctrl button {
              background-color: var(--bg-panel) !important;
              color: var(--text-main) !important;
              border-bottom: 1px solid var(--border-muted) !important;
              transition: all 0.15s ease;
            }
            .leaflet-bar a:hover,
            .maplibregl-ctrl button:hover {
              background-color: var(--bg-alt) !important;
              color: var(--accent) !important;
            }
            .dark-popup .leaflet-popup-content-wrapper,
            .dark-maplibre-popup .maplibregl-popup-content {
              background-color: #161619 !important;
              color: #ffffff !important;
              border: 1px solid rgba(143, 211, 199, 0.3) !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
            }
            .dark-popup .leaflet-popup-tip,
            .dark-maplibre-popup .maplibregl-popup-tip {
              background-color: #161619 !important;
              border-left: 1px solid rgba(143, 211, 199, 0.3) !important;
              border-bottom: 1px solid rgba(143, 211, 199, 0.3) !important;
            }
            .light-popup .leaflet-popup-content-wrapper,
            .light-maplibre-popup .maplibregl-popup-content {
              background-color: #ffffff !important;
              color: #111111 !important;
              border: 1px solid #ccc !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            }
            .light-popup .leaflet-popup-tip,
            .light-maplibre-popup .maplibregl-popup-tip {
              background-color: #ffffff !important;
            }
            .maplibregl-popup-content {
              padding: 0 !important;
            }
            .maplibre-shelter-marker {
              transition: transform 0.15s ease;
            }
            .maplibre-shelter-marker:hover {
              transform: scale(1.08);
            }
            @keyframes pulse {
              0% { transform: scale(0.9); opacity: 0.3; }
              50% { transform: scale(1.3); opacity: 0.6; }
              100% { transform: scale(0.9); opacity: 0.3; }
            }
          `}</style>

          {selectedShelter && (
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-[var(--bg-panel)]/95 border border-[var(--border-muted)] backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-start justify-between gap-4 animate-fade-in max-w-xl mx-auto">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-solid)]/15 border border-[var(--accent)]/30 text-[var(--accent)] mt-0.5">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-main)]">{selectedShelter.adresse}</h4>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-wide text-[var(--text-dim)]">
                    {currentLang === 'no' ? 'Hentet adresse' : 'Retrieved address'}: {selectedShelter.adresse}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--text-dim)] font-mono">
                    <span>Rom: #{selectedShelter.romnr}</span>
                    <span>?</span>
                    <span className="text-[var(--text-main)] font-semibold">{selectedShelter.plasser} {currentLang === 'no' ? 'plasser' : 'spaces'}</span>
                    {userCoords && (
                      <>
                        <span>?</span>
                        <span className="text-[var(--accent)] font-bold">{getDistanceString(selectedShelter)}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {openStreetMapHref && (
                      <a
                        href={openStreetMapHref}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={currentLang === 'no' ? 'Åpne i OpenStreetMap' : 'Open in OpenStreetMap'}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-muted)] px-2.5 py-1 text-[10px] font-mono font-bold text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>OpenStreetMap</span>
                      </a>
                    )}
                    {nativeMapHref && (
                      <a
                        href={nativeMapHref}
                        target={nativeMapTarget}
                        rel={nativeMapRel}
                        aria-label={currentLang === 'no' ? 'Åpne i telefonens kartapp' : 'Open in your phone maps app'}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-muted)] px-2.5 py-1 text-[10px] font-mono font-bold text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{currentLang === 'no' ? 'Kartapp' : 'Native map'}</span>
                      </a>
                    )}
                    <a
                      href={SHELTER_SOURCE_DATA_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-muted)] px-2.5 py-1 text-[10px] font-mono font-bold text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{currentLang === 'no' ? 'Datakilde' : 'Data source'}</span>
                    </a>
                    <a
                      href={SHELTER_SOURCE_GUIDANCE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-muted)] px-2.5 py-1 text-[10px] font-mono font-bold text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{currentLang === 'no' ? 'Råd fra DSB' : 'DSB guidance'}</span>
                    </a>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedShelter(null)}
                className="text-xs font-mono font-bold hover:text-[var(--accent-on-solid)] text-[var(--text-dim)] px-2 py-1 rounded hover:bg-white/5"
              >
                {currentLang === 'no' ? 'LUKK' : 'CLOSE'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-text)] rounded-xl flex gap-3 items-start max-w-4xl">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong>{currentLang === 'no' ? 'Viktig om tilfluktsrom:' : 'Important shelter advisory:'}</strong>
          <p className="mt-1">
            {currentLang === 'no'
              ? 'Offentlige tilfluktsrom er ment for personer som befinner seg utendørs eller på reise når det gis et nødvarsel. Dersom du er hjemme, skal du søke dekning i egen bygning (kjeller, under trapp, innerrom) fremfor å bevege deg ut for å oppsøke et offentlig tilfluktsrom. Husk at Sivilforsvaret kan bruke opptil 72 timer på å klargjøre offentlige tilfluktsrom for drift etter beordring.'
              : 'Public emergency shelters are meant for people outdoors or on the move when an emergency alert is issued. If you are inside a building (your home), you should seek shelter in the basement or interior rooms of that building rather than going outdoors to find a shelter. Civil defense authorities have 72 hours to prepare shelters after an order is issued.'}
          </p>
        </div>
      </div>
    </div>
  );
}



