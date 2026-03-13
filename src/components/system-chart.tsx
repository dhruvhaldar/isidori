"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SystemChartProps {
  data: { time: number; y: number; d: number }[];
}

const formatScientific = (value: number) => {
  return value.toExponential(2);
};

export function SystemChart({ data }: SystemChartProps) {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
          <YAxis 
            tickFormatter={formatScientific}
            label={{ value: 'Value', angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip formatter={(value: number) => formatScientific(value)} />
          <Legend />
          <Line type="monotone" dataKey="y" stroke="#8884d8" name="Output y(t)" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="d" stroke="#82ca9d" name="Disturbance d(t)" dot={false} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
