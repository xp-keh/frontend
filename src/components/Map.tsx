"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export const locations = [
  { name: "Kretek", lat: -7.9923, lon: 110.2973 },
  { name: "Jogjakarta", lat: -7.8021, lon: 110.3628 },
  { name: "Menggoran", lat: -7.9525, lon: 110.4942 },
  { name: "Bandara_DIY", lat: -7.9007, lon: 110.0573 },
  { name: "Bantul", lat: -7.875, lon: 110.3268 },
];

const Map = ({ onSelectCity }: { onSelectCity: (city: string) => void }) => {
  const [locationIcon, setLocationIcon] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        setLocationIcon(
          L.icon({
            iconUrl: "/location-pin.png",
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
          })
        );
      });
    }
  }, []);

  return (
    <MapContainer
      center={[-7.9, 110.3]}
      zoom={10}
      className="w-full h-full rounded-lg"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc) => (
        <Marker
          key={loc.name}
          position={[loc.lat, loc.lon]}
          icon={locationIcon}
          eventHandlers={{ click: () => onSelectCity(loc.name) }}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
