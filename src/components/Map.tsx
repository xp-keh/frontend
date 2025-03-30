"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Location = {
  name: string;
  lat: number;
  lon: number;
};

const locations: Location[] = [
  { name: "Kretek", lat: -7.9923, lon: 110.2973 },
  { name: "Jogjakarta", lat: -7.8021, lon: 110.3628 },
  { name: "Menggoran", lat: -7.9525, lon: 110.4942 },
  { name: "Bandara_DIY", lat: -7.9007, lon: 110.0573 },
  { name: "Bantul", lat: -7.875, lon: 110.3268 },
];

const Map = ({ onSelectCity }: { onSelectCity: (city: string) => void }) => {
  return (
    <MapContainer
      center={[-7.9, 110.3]}
      zoom={10}
      className="w-full h-full rounded-8xl"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc) => (
        <Marker
          key={loc.name}
          position={[loc.lat, loc.lon]}
          eventHandlers={{ click: () => onSelectCity(loc.name) }}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
