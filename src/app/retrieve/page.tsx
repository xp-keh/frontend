'use client';

import { useEffect, useState } from 'react';
import Navbar from "../../components/Navbar";
import { getCities, getPreviewData, getSummaryData, downloadData, City, getSeismicGraphData, getWeatherGraphData } from '@/actions/retrieve';
import SeismicLineChart from '@/components/SeismicLineChart';
import WeatherChart from '@/components/WeatherChart';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

export default function RetrievePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(new Date('2024-01-01T00:00:00'));
  const [endTime, setEndTime] = useState<Date | null>(new Date('2024-01-02T12:00:00'));
  const [result, setResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [seismic, setSeismic] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);

  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  // Fetch city list when component mounts
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedCity) {
      alert('Please select a city!');
      return;
    }

    if (!selectedCity || !startTime || !endTime) {
      alert('Please select a city and both time ranges!');
      return;
    }

    const formatDateToLocalString = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    
    const formattedStart = formatDateToLocalString(startTime);
    const formattedEnd = formatDateToLocalString(endTime);    

    try {
      setSummary(null);
      setResult(null);
      setSeismic(null);
      setWeather(null);

      setLoadingPreview(true);
      const previewData = await getPreviewData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      console.log('Preview Data:', previewData);
      setResult(previewData);

      setLoadingSummary(true);
      const ragSummary = await getSummaryData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      console.log('Summary:', ragSummary);
      setSummary(ragSummary.message);
      setLoadingSummary(false);

      const seismicData = await getSeismicGraphData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      console.log('Seismic Data:', seismicData);
      setSeismic(seismicData);

      const weatherData = await getWeatherGraphData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );
      console.log('Weather Data:', weatherData);
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      alert('Failed to retrieve data. Please check console.');
    } finally {
      setLoadingPreview(false);
      setLoadingSummary(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedCity) {
      alert('Please select a city before downloading!');
      return;
    }

    if (!selectedCity || !startTime || !endTime) {
      alert('Please select a city and both time ranges!');
      return;
    }

    const formattedStart = startTime.toISOString().slice(0, 19).replace('T', ' ');
    const formattedEnd = endTime.toISOString().slice(0, 19).replace('T', ' ');

    try {
      setLoadingDownload(true);
      const fileBlob = await downloadData(
        formattedStart,
        formattedEnd,
        selectedCity.latitude,
        selectedCity.longitude
      );

      // Create a download link dynamically 
      const url = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_${selectedCity.city}_${startTime}_${endTime}.csv`; // You can adjust file name/format
      document.body.appendChild(a);
      a.click();
      a.remove(); // Clean up
      window.URL.revokeObjectURL(url); // Release object URL
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
    <div className="min-h-screen bg-[#0f111a]">
      <Navbar />
      <div className="p-12 max-w-screen mx-auto bg-[#0f111a] text-white min-h-screen">
        <div className="bg-[#1c1e29] p-6 rounded-xl shadow-md space-y-4 mb-6">
          <h1 className="text-xl font-bold mb-2">Retrieve Data Preview</h1>

          {/* City Selector */}
          <div>
            <label className="block mb-1 font-medium">Select City</label>
            <select
              className="w-full bg-[#2a2d3e] border border-gray-600 p-2 rounded text-white"
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
                className="w-full bg-[#2a2d3e] border border-gray-600 p-2 rounded text-white"
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
                className="w-full bg-[#2a2d3e] border border-gray-600 p-2 rounded text-white"
                wrapperClassName="w-full"
                calendarClassName="bg-[#2a2d3e] text-white"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              disabled={loadingPreview}
            >
              {loadingPreview ? 'Previewing...' : 'Preview Data'}
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
              disabled={loadingDownload}
            >
              {loadingDownload ? 'Downloading...' : 'Download Data'}
            </button>
          </div>
        </div>

        {loadingSummary ? (
          <div className="bg-[#1c1e29] p-6 rounded-xl shadow-md space-y-4 animate-pulse">
            <h2 className="text-lg font-semibold">Weather Summary</h2>
            <div className="bg-[#2a2d3e] p-4 rounded-md text-sm text-gray-400 italic">
              Generating summary...
            </div>
          </div>
        ) : summary && (
          <div className="bg-[#1c1e29] p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-lg font-semibold">Weather Summary</h2>
            <p className="text-sm bg-[#2a2d3e] p-4 rounded-md whitespace-pre-line">
              {summary}
            </p>
          </div>
        )}


        {result?.merged_data?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Top 100 Records</h2>
            <div className="overflow-x-auto max-h-[400px] border border-gray-700 rounded-lg relative">
              <table className="min-w-full text-xs text-white">
                <thead className="bg-[#2a2d3e] text-white sticky top-0">
                  <tr>
                    {Object.keys(result.merged_data[0]).map((key) => (
                      <th key={key} className="px-3 py-2 border-b border-gray-600">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.merged_data.slice(0, 100).map((record: any, i: number) => (
                    <tr key={i} className="odd:bg-[#1c1e29] even:bg-[#222433]">
                      {Object.values(record).map((val, j) => (
                        <td key={j} className="px-3 py-1 border-b border-gray-700">
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
            <div className="bg-[#1c1e29] p-4 rounded-xl shadow">
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
            <div className="bg-[#1c1e29] p-4 rounded-xl shadow">
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
