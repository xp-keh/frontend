import { useEffect, useState } from "react";

interface SeismicDataPoint {
  dt: string;
  station: string;
  channel: string;
  data: number;
}

const useSeismicWebSocket = (url: string) => {
  const [seismicData, setSeismicData] = useState<SeismicDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("✅ Seismic WebSocket connected to", url);
    };

    socket.onmessage = (event) => {
      try {
        // console.log("📥 Raw message received:", event.data);
        const newData = JSON.parse(event.data);

        const parsedData: SeismicDataPoint = {
          dt: newData.dt,
          station: newData.station,
          channel: newData.channel,
          data: newData.data,
        };

        setSeismicData((prevData) => [...prevData, parsedData].slice(-1000));
        // keep only the last 1000 points to avoid memory explosion
      } catch (err) {
        console.error("❌ WebSocket Error:", err);
        setError("Error parsing incoming seismic data");
      }
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket Error:", err);
      setError("Failed to connect to the Seismic WebSocket stream");
    };

    socket.onclose = (event) => {
      console.warn(
        `🔌 Seismic WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`
      );
      if (event.code !== 1000) {
        setError(`WebSocket closed unexpectedly: ${event.reason || "Unknown"}`);
      }
    };

    return () => {
      console.log("🧹 Cleaning up Seismic WebSocket connection...");
      socket.close();
    };
  }, [url]);

  return { seismicData, error };
};

export default useSeismicWebSocket;
