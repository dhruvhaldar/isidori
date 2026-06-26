"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SystemChartProps {
  data: { time: number; y: number; d: number }[];
}

const formatScientific = (value: number) => {
  return value.toExponential(2);
};

// ⚡ Bolt: Memoize the chart component to prevent expensive Recharts
// re-renders when the user types in the matrix inputs on the parent page.
export const SystemChart = React.memo(function SystemChart({ data }: SystemChartProps) {
  // 🎨 Palette: Limit the screen reader table to a reasonable number of points
  // to prevent excessive DOM bloat and navigation fatigue.
  const accessibleData = data.length > 50 ? data.slice(0, 50) : data;

  return (
    <div className="relative w-full" role="group" aria-label="System simulation response chart">
      <div style={{ width: '100%', height: 400 }} aria-hidden="true">
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
            <Line type="monotone" dataKey="y" stroke="#2563eb" name="Output y(t)" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="d" stroke="#ef4444" name="Disturbance d(t)" dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="sr-only">
        <table aria-label="System simulation response data">
          <thead>
            <tr>
              <th scope="col">Time (s)</th>
              <th scope="col">Output y(t)</th>
              <th scope="col">Disturbance d(t)</th>
            </tr>
          </thead>
          <tbody>
            {accessibleData.map((row, i) => (
              <tr key={i}>
                <td>{row.time}</td>
                <td>{formatScientific(row.y)}</td>
                <td>{formatScientific(row.d)}</td>
              </tr>
            ))}
            {data.length > 50 && (
              <tr>
                <td colSpan={3}>... and {data.length - 50} more data points omitted.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
