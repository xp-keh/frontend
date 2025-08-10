"use client";
import LeafMap from "../../components/LeafMap";
import { locations } from "../../components/LeafMap";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import useSeismicWebSocket from "../../hooks/useSeismicWebSocket";
import SeismicWSChart from "../../components/SeismicWSChart";

const SeismicDashboard = () => {
  console.log(`${process.env.NEXT_PUBLIC_SEISMIC_WEBSOCKET}/ws`);
  const { seismicData, error } = useSeismicWebSocket(
    `${process.env.NEXT_PUBLIC_SEISMIC_WEBSOCKET}/ws-seismic`
  );

  const [selectedStation, setSelectedStation] = useState(locations[1].name);

  const getStationCoordinates = (cityName: string) => {
    const station = locations.find((loc) => loc.name === cityName);
    return station
      ? {
          city: station.city,
          province: station.province,
          lat: station.lat,
          lon: station.lon,
        }
      : { city: "", province: "", lat: "", lon: "" };
  };

  const { city, province, lat, lon } = getStationCoordinates(selectedStation);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="grid grid-cols-2 grid-rows-3 gap-2 p-3 h-screen">
        <div className="col-span-1 row-span-2 bg-gray-300 rounded-lg flex items-center justify-center">
          <LeafMap onSelectStation={setSelectedStation} />
        </div>
        <div className="bg-chartGray  text-white p-2 rounded-lg flex flex-col">
          <p>BHZ</p>
          <SeismicWSChart
            seismicData={seismicData}
            selectedStation={selectedStation}
            selectedChannel="BHZ"
          />
        </div>
        <div className="bg-chartGray  text-white p-2 rounded-lg flex flex-col">
          <p>BHN</p>
          <SeismicWSChart
            seismicData={seismicData}
            selectedStation={selectedStation}
            selectedChannel="BHN"
          />
        </div>
        <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
          <p>General Information</p>
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold">{city}</h3>
            <span className="text-sm font-semibold">{province}</span>
          </div>

          <span className="text-sm justify-center">
            {lat && lon ? `(${lat},${lon})` : "Coordinates not found"}
          </span>
        </div>

        <div className="bg-chartGray  text-white p-2 rounded-lg flex flex-col">
          <p>BHE</p>
          <SeismicWSChart
            seismicData={seismicData}
            selectedStation={selectedStation}
            selectedChannel="BHE"
          />
        </div>
      </div>
    </div>
  );
};

export default SeismicDashboard;
