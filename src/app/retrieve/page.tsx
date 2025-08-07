'use client';

import { useEffect, useState } from 'react';
import Navbar from "../../components/Navbar";
import { getCities, getPreviewData, getSummaryData, downloadData, City, getSeismicGraphData, getWeatherGraphData } from '@/actions/retrieve';
import SeismicLineChart from '@/components/SeismicLineChart';
import WeatherChart from '@/components/WeatherChart';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

export default function RetrievePage() {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(todayMidnight);
  const [endTime, setEndTime] = useState<Date | null>(todayMidnight);
  const [result, setResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [seismic, setSeismic] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);

  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  const [errorPreview, setErrorPreview] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [errorSeismic, setErrorSeismic] = useState<string | null>(null);
  const [errorWeather, setErrorWeather] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitiesList = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to load cities:', error);
      }
    };
    fetchCitiesList();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCity) {
      alert('Please select a city!');
      return;
    }

    if (!selectedCity || !startTime || !endTime) {
      alert('Please select a city and both time ranges!');
      return;
    }

    if (endTime < startTime) {
      alert('End time cannot be earlier than start time!');
      return;
    }

    if (endTime > new Date()) {
      alert('End time cannot be in the future!');
      return;
    }

    const formatDateToLocalString = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const formattedStart = formatDateToLocalString(startTime);
    const formattedEnd = formatDateToLocalString(endTime);

    setSummary(null);
    setResult(null);
    setSeismic(null);
    setWeather(null);

    setErrorPreview(null);
    setErrorSummary(null);
    setErrorSeismic(null);
    setErrorWeather(null);

    try {
      setLoadingPreview(true);
      const previewData = await getPreviewData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      setResult(previewData);
      console.log(previewData)
    } catch (error) {
      console.error('Preview error:', error);
      setErrorPreview('⚠️ Failed to retrieve preview data.');
    } finally {
      setLoadingPreview(false);
    }

    try {
      setLoadingSummary(true);
      const ragSummary = await getSummaryData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      setSummary(ragSummary.message);
    } catch (error) {
      console.error('Summary error:', error);
      setErrorSummary('⚠️ Failed to retrieve weather summary.');
    } finally {
      setLoadingSummary(false);
    }

    try {
      const seismicData = await getSeismicGraphData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      setSeismic(seismicData);
    } catch (error) {
      console.error('Seismic error:', error);
      setErrorSeismic('⚠️ Failed to retrieve seismic data.');
    }

    try {
      const weatherData = await getWeatherGraphData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      setWeather(weatherData);
    } catch (error) {
      console.error('Weather error:', error);
      setErrorWeather('⚠️ Failed to retrieve weather data.');
    }
  };

  const handleDownload = async () => {
    if (!selectedCity || !startTime || !endTime) {
      alert('Please select a city and both time ranges!');
      return;
    }

    if (endTime < startTime) {
      alert('End time cannot be earlier than start time!');
      return;
    }

    if (endTime > new Date()) {
      alert('End time cannot be in the future!');
      return;
    }

    const formattedStart = startTime.toISOString().slice(0, 19).replace('T', ' ');
    const formattedEnd = endTime.toISOString().slice(0, 19).replace('T', ' ');

    const startString = startTime.toISOString().split("T")[0];
    const endString = endTime.toISOString().split("T")[0];

    try {
      setLoadingDownload(true);
      const fileBlob = await downloadData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );

      const url = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_${selectedCity.city}_${startString}_${endString}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove(); // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download data. Please check console.');
    } finally {
      setLoadingDownload(false);
    }
  };

  const uniqueSummaries =
    result?.merged_data
      ? Array.from(
        new Map(
          result.merged_data.map((item: any) => {
            const key = `${item.partition_date}_${item.seismic_table}_${item.weather_table}`;
            return [key, item];
          })
        ).values()
      )
      : [];


  return (
    <div className="min-h-screen bg-black]">
      <Navbar />
      <div className="p-12 max-w-screen mx-auto bg-black text-white min-h-screen">
        <div className="bg-[#14151d] p-6 rounded-xl shadow-md space-y-4 mb-6">
          <h1 className="text-xl font-bold mb-2">Retrieve Data Preview</h1>

          {/* City Selector */}
          <div>
            <label className="block mb-1 font-medium">Select City</label>
            <select
              className="w-full border bg-[#1d1f2b] border-[#444654] p-2 rounded text-white"
              onChange={(e) => {
                const city = cities.find((c) => c.city === e.target.value) || null;
                setSelectedCity(city);
              }}
              defaultValue=""
            >
              <option value="" disabled>-- Select City --</option>
              {cities.map((city) => (
                <option key={city.city} value={city.city}>{city.city}</option>
              ))}
            </select>
          </div>

          <p className="text-sm text-yellow-500 mt-2">
            Note: Data is available starting from <strong>20 May 2025</strong>.
          </p>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Time</label>
              <DatePicker
                selected={startTime}
                onChange={(date: Date | null) => setStartTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={60}
                dateFormat="yyyy-MM-dd HH:mm:ss"
                className="w-full border bg-[#1d1f2b] border-[#444654] p-2 rounded text-white"
                wrapperClassName="w-full"
                calendarClassName="bg-[#2a2d3e] text-white"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Time</label>
              <DatePicker
                selected={endTime}
                onChange={(date: Date | null) => setEndTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={60}
                dateFormat="yyyy-MM-dd HH:mm:ss"
                className="w-full border bg-[#1d1f2b] border-[#444654] p-2 rounded text-white"
                wrapperClassName="w-full"
                calendarClassName="bg-[#2a2d3e] text-white"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] text-white font-semibold px-4 py-2 rounded"
              disabled={loadingPreview}
            >
              {loadingPreview ? 'Previewing...' : 'Preview Data'}
            </button>
            <button
              onClick={handleDownload}
              className="bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] text-white font-semibold px-4 py-2 rounded"
              disabled={loadingDownload}
            >
              {loadingDownload ? 'Downloading...' : 'Download Data'}
            </button>
          </div>
        </div>

        {loadingSummary ? (
          <div className="bg-[#14151d] p-6 rounded-xl shadow-md space-y-4 animate-pulse">
            <h2 className="text-lg font-semibold">Weather Summary</h2>
            <div className="bg-[#1d1f2b] p-4 rounded-md text-sm text-gray-400 italic">
              Generating summary...
            </div>
          </div>
        ) : summary && (
          <div className="bg-[#14151d] p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-lg font-semibold">Weather Summary</h2>
            <p className="text-sm bg-[#1d1f2b] p-4 rounded-md whitespace-pre-line">
              {summary}
            </p>
          </div>
        )}


        {result?.previewData?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Top 10 Records</h2>
            <div className="overflow-x-auto max-h-[400px] border border-gray-700 rounded-lg relative">
              <table className="min-w-full text-xs text-white">
                <thead className="bg-[#2a2d3e] text-white sticky top-0">
                  <tr>
                    {Object.keys(result.previewData[0]).map((key) => (
                      <th key={key} className="px-3 py-2 border-b border-gray-600">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.previewData.slice(0, 100).map((record: any, i: number) => (
                    <tr key={i} className="odd:bg-[#1c1e29] even:bg-[#222433]">
                      {Object.values(record).map((val, j) => (
                        <td key={j} className="px-3 py-1 border-b border-gray-700 text-center">
                          {typeof val === 'number' ? val.toFixed(2) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {seismic?.graph_data && (
            <div className="bg-[#14151d] p-4 rounded-xl shadow">
              <h2 className="text-md font-semibold mb-2">Seismic Signal Graph</h2>
              <SeismicLineChart
                hnz={seismic.graph_data.hnz}
                hnn={seismic.graph_data.hnn}
                hne={seismic.graph_data.hne}
              />
              <p className="text-xs mt-2 text-gray-400">
                <span className="text-yellow-400">● HNZ</span> (Vertical),{" "}
                <span className="text-green-400">● HNN</span> (North-South),{" "}
                <span className="text-blue-400">● HNE</span> (East-West)
              </p>
            </div>
          )}

          {weather?.graph_data && (
            <div className="bg-[#14151d] p-4 rounded-xl shadow">
              <h2 className="text-md font-semibold">Weather Data</h2>
              <WeatherChart
                temp={weather.graph_data.temp}
                wind={weather.graph_data.wind}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
