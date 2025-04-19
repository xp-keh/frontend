'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface SeismicPoint {
  timestamp: string;
  value: number;
}

interface Props {
  hnz: SeismicPoint[];
  hnn: SeismicPoint[];
  hne: SeismicPoint[];
}

const getFourTicks = (data: SeismicPoint[]) => {
  if (data.length < 4) return data.map((d) => d.timestamp);
  const first = Math.floor(data.length / 12.5);
  const second = Math.floor(1 * data.length / 3);
  const third = Math.floor(2 * data.length / 3);
  return [
    data[first].timestamp,
    data[second].timestamp,
    data[third].timestamp,
    data[data.length-first].timestamp,
  ];
};


const SeismicLineChart: React.FC<Props> = ({ hnz, hnn, hne }) => {
  // Convert each dataset into recharts-friendly format
  const formatData = (data: SeismicPoint[]) =>
    data.map((d) => ({ timestamp: d.timestamp, value: d.value }));

  const chartStyle = { height: 100, marginBottom: 16 }; // Style for stacked look

  return (
    <div className="w-full">
      <div style={chartStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatData(hnz)}>
            <CartesianGrid stroke="#2c2e3a" strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: '#1c1e29', border: 'none', fontSize: '0.75rem' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="value" stroke="#facc15" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={chartStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatData(hnn)}>
            <CartesianGrid stroke="#2c2e3a" strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: '#1c1e29', border: 'none', fontSize: '0.75rem' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={chartStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatData(hne)}>
            <CartesianGrid stroke="#2c2e3a" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              ticks={getFourTicks(hne)} // Explicitly set 4 labels
              interval={0}
              tick={{ fontSize: 10, fill: '#ccc' }} // Smaller, lighter ticks
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: '#1c1e29', border: 'none', fontSize: '0.75rem' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeismicLineChart;
