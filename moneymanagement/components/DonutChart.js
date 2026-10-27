'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLOR_PALETTE = ['#3B82F6', '#93C5FD', '#1D4ED8', '#BFDBFE', '#60A5FA', '#818CF8'];

export default function DonutChart({ customData = [] }) {
  if (!customData || customData.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-gray-400">
        Belum ada data transaksi bulan ini.
      </div>
    );
  }

  const chartData = customData.map((item, index) => ({
    ...item,
    color: item.color || COLOR_PALETTE[index % COLOR_PALETTE.length],
  }));

  return (
    <div className="flex items-center justify-between">
      <div className="w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={30}
              outerRadius={45}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => `Rp${Number(val).toLocaleString('id-ID')}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5 text-xs flex-1 ml-4">
        {chartData.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-700 truncate max-w-[90px]">{item.name}</span>
            </div>
            <span className="font-bold text-gray-900">{item.display}</span>
          </div>
        ))}
      </div>
    </div>
  );
}