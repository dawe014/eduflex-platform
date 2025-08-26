"use client";

import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export const Chart = ({ data }: ChartProps) => {
  return (
    <Card className="p-4 pt-8">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            // Optional: rotate labels if they are long
            // angle={-45}
            // textAnchor="end"
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`} // Format ticks as currency
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ fontWeight: "bold" }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            verticalAlign="top"
            align="right"
            wrapperStyle={{ top: -10, right: 0 }}
          />
          <Bar
            dataKey="total"
            fill="#0369a1" // A nice sky-700 color
            radius={[4, 4, 0, 0]}
            name="Revenue" // Name for the legend and tooltip
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
