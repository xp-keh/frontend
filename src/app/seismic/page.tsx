"use client";
import LeafMap from "../../components/LeafMap";
import { locations } from "../../components/LeafMap";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import useWeatherWebSocket from "../../hooks/useWeatherWebSocket";
import SeismicChart from "@/components/SeismicChart";

const SeismicDashboard = () => {
  // const { seismic, error } = useWeatherWebSocket(
  //   "ws://85.209.163.202:8014/ws-seismic"
  // );

  const [selectedStation, setSelectedStation] = useState(locations[0].name);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="grid grid-cols-3 grid-rows-3 gap-2 p-3 h-screen">
        <div className="col-span-2 row-span-2 bg-gray-300 rounded-lg flex items-center justify-center">
          <LeafMap onSelectStation={setSelectedStation} />
        </div>
        <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
          <p>BHN Data</p>
          <SeismicChart selectedStation={selectedStation} channel="BHN" />
        </div>
        <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
          <p>BHZ Data</p>
          <SeismicChart selectedStation={selectedStation} channel="BHZ" />
        </div>
        <div className="bg-chartGray col-span-2 text-white p-2 rounded-lg flex flex-col">
          <p>General Information</p>
        </div>
        <div className="bg-chartGray text-white p-2 rounded-lg flex flex-col">
          <p>BHE Data</p>
          <SeismicChart selectedStation={selectedStation} channel="BHE" />
        </div>
      </div>
    </div>
  );
};

export default SeismicDashboard;
