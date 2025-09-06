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
  data: { name: string; [key: string]: number | string }[];
  dataKey: string;
  color: string;
}

export const Chart = ({ data, dataKey, color }: ChartProps) => {
  return (
    <Card className="p-4 pt-8">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              dataKey === "revenue" ? `$${value}` : `${value}`
            }
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ fontWeight: "bold" }}
            formatter={(value) => {
              const label = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);
              const formattedValue =
                dataKey === "revenue" ? `$${Number(value).toFixed(2)}` : value;
              return [formattedValue, label];
            }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            verticalAlign="top"
            align="right"
            wrapperStyle={{ top: -10, right: 0 }}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
