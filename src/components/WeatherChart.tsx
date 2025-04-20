'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface WeatherChartProps {
  temp: { timestamp: string; value: number }[];
  wind: { timestamp: string; value: number }[];
}

export default function WeatherChart({ temp, wind }: WeatherChartProps) {
  const data = temp.map((t, i) => ({
    timestamp: t.timestamp,
    temp: +(t.value - 273.15).toFixed(2), // Kelvin to Celsius
    wind: wind[i]?.value ?? null,
  }));

  return (
    <div className="space-y-6">
      {/* Temperature Line Chart */}
      <div className="h-48">
        <h3 className="text-sm text-white mb-2">Temperature</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="timestamp" tick={false} />
            <YAxis unit="°C" domain={['auto', 'auto']} tick={{ fill: '#ccc' }} />
            <Tooltip />
            <Line type="monotone" dataKey="temp" stroke="#f87171" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wind Speed Bar Chart */}
      <div className="h-48">
        <h3 className="text-sm text-white mb-2">Wind Speed</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="timestamp" tick={false} />
            <YAxis unit="m/s" domain={['auto', 'auto']} tick={{ fill: '#ccc' }} />
            <Tooltip />
            <Bar dataKey="wind" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
