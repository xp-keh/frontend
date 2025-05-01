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
  {
    name: "TNTI",
    city: "Ternate",
    province: "North Maluku",
    lat: 0.7718,
    lon: 127.3667,
  },
  {
    name: "TOLI",
    city: "Toli-Toli",
    province: "Central Sulawesi",
    lat: 1.1214,
    lon: 120.7944,
  },
  {
    name: "GENI",
    city: "Genyem",
    province: "Papua",
    lat: -2.5927,
    lon: 140.1678,
  },
  {
    name: "PMBI",
    city: "Palembang",
    province: "South Sumatra",
    lat: -2.9024,
    lon: 104.6993,
  },
  {
    name: "BKB",
    city: "Balikpapan",
    province: "East Kalimantan",
    lat: -1.1073,
    lon: 116.9048,
  },
  {
    name: "SOEI",
    city: "Soe",
    province: "East Nusa Tenggara",
    lat: -9.7553,
    lon: 124.2672,
  },
  {
    name: "SANI",
    city: "Sanana",
    province: "North Maluku",
    lat: -2.0496,
    lon: 125.9881,
  },
  {
    name: "MMRI",
    city: "Maumere",
    province: "East Nusa Tenggara",
    lat: -8.6357,
    lon: 122.2376,
  },
  {
    name: "PMBT",
    city: "Palembang",
    province: "South Sumatra",
    lat: -2.927,
    lon: 104.772,
  },
  {
    name: "TOLI2",
    city: "Toli-Toli",
    province: "Central Sulawesi",
    lat: 1.11119,
    lon: 120.78174,
  },
  {
    name: "BKNI",
    city: "Pekanbaru",
    province: "Riau",
    lat: 0.3262,
    lon: 101.0396,
  },
  {
    name: "UGM",
    city: "Yogyakarta",
    province: "Special Region",
    lat: -7.9125,
    lon: 110.5231,
  },
  {
    name: "FAKI",
    city: "Fakfak",
    province: "West Papua",
    lat: -2.91925,
    lon: 132.24889,
  },
  {
    name: "CISI",
    city: "Ciamis",
    province: "West Java",
    lat: -7.5557,
    lon: 107.8153,
  },
  {
    name: "BNDI",
    city: "Banda",
    province: "Maluku",
    lat: -4.5224,
    lon: 129.9045,
  },
  {
    name: "PLAI",
    city: "Pulau Laut",
    province: "West Nusa Tenggara",
    lat: -8.8275,
    lon: 117.7765,
  },
  {
    name: "MNAI",
    city: "Manna",
    province: "Bengkulu",
    lat: -4.3605,
    lon: 102.9557,
  },
  {
    name: "GSI",
    city: "Gunung Sitoli",
    province: "North Sumatra",
    lat: 1.3039,
    lon: 97.5755,
  },
  {
    name: "SMRI",
    city: "Semarang",
    province: "Central Java",
    lat: -7.04915,
    lon: 110.44067,
  },
  {
    name: "SAUI",
    city: "Savu",
    province: "East Nusa Tenggara",
    lat: -7.9826,
    lon: 131.2988,
  },
  {
    name: "YOGI",
    city: "Yogyakarta",
    province: "Special Region",
    lat: -7.8166,
    lon: 110.2949,
  },
  {
    name: "LHMI",
    city: "Lhokseumawe",
    province: "Aceh",
    lat: 5.2288,
    lon: 96.9472,
  },
  {
    name: "LUWI",
    city: "Luwuk",
    province: "Central Sulawesi",
    lat: -1.0418,
    lon: 122.7717,
  },
  {
    name: "JAGI",
    city: "Jembrana",
    province: "Bali",
    lat: -8.4702,
    lon: 114.1521,
  },
];

const LeafMap = ({
  onSelectStation,
}: {
  onSelectStation: (city: string) => void;
}) => {
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
      center={[-1.23, 116.0]}
      zoom={5}
      className="w-full h-full rounded-lg"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locationIcon &&
        locations.map((loc) => (
          <Marker
            key={loc.name}
            position={[loc.lat, loc.lon]}
            icon={locationIcon}
            eventHandlers={{ click: () => onSelectStation(loc.name) }}
          >
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default LeafMap;
