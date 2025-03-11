'use client';

import { useEffect, useState } from 'react';
import { getCities, getPreviewData, downloadData, City } from '@/actions/retrieve';

export default function RetrievePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [startTime, setStartTime] = useState<string>('2024-01-01 00:00:00');
  const [endTime, setEndTime] = useState<string>('2024-01-02 12:00:00');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

    try {
      setLoading(true);
      const previewData = await getPreviewData(
        startTime,
        endTime,
        selectedCity.latitude,
        selectedCity.longitude
      );
      console.log('Preview Data:', previewData); // Check this in console
      setResult(previewData);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      alert('Failed to retrieve data. Please check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedCity) {
      alert('Please select a city before downloading!');
      return;
    }

    try {
      setLoading(true);
      const fileBlob = await downloadData(
        startTime,
        endTime,
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
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Retrieve Data Preview</h1>

      {/* City Dropdown */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select City:</label>
        <select
          className="w-full border p-2 pr-8 rounded"
          onChange={(e) => {
            const city = cities.find((c) => c.city === e.target.value) || null;
            setSelectedCity(city);
          }}
          defaultValue=""
        >
          <option value="" disabled>
            -- Select City --
          </option>
          {cities.map((city) => (
            <option key={city.city} value={city.city}>
              {city.city}
            </option>
          ))}
        </select>
      </div>

      {/* Start Time Input */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Start Time:</label>
        <input
          type="text"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="YYYY-MM-DD HH:mm:ss"
        />
      </div>

      {/* End Time Input */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">End Time:</label>
        <input
          type="text"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="YYYY-MM-DD HH:mm:ss"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Preview Data'}
        </button>

        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Preparing Download...' : 'Download Data'}
        </button>
      </div>


      {/* Display Result */}
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Summary of Queried Tables:</h2>

          {/* 1. List all queried partition dates and tables */}
          <div className="space-y-2 text-black">
            {result.merged_data.map((item: any, index: number) => (
              <div key={index} className="p-3 border rounded bg-gray-50">
                <p><strong>📅 Partition Date:</strong> {item.partition_date}</p>
                <p><strong>🌋 Seismic Table:</strong> {item.seismic_table}</p>
                <p><strong>🌦️ Weather Table:</strong> {item.weather_table}</p>
              </div>
            ))}
          </div>

          {/* 2. Show Top 100 records from the first partition */}
          {result.merged_data.length > 0 && result.merged_data[0].data.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Top 100 Full Records from First Partition:</h2>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="min-w-full border text-xs">
                  <thead>
                    <tr className="bg-gray-200">
                      {Object.keys(result.merged_data[0].data[0]).map((key, idx) => (
                        <th key={idx} className="border px-2 py-1 text-black">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.merged_data[0].data.slice(0, 100).map((record: any, rowIdx: number) => (
                      <tr key={rowIdx} className="odd:bg-white even:bg-gray-100">
                        {Object.values(record).map((value, colIdx) => (
                          <td key={colIdx} className="border px-2 py-1 text-black">
                            {typeof value === 'number' ? value.toFixed(4) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Handle empty data */}
          {result.merged_data.length === 0 && (
            <p className="text-red-500 mt-4">No data available for this selection.</p>
          )}
        </div>
      )}

    </div>
  );
}
