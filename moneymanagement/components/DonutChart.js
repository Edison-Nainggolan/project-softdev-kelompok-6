'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const dataKategoriDonut = [
  { name: 'Makan', value: 595000, display: 'Rp595.000', color: '#3B82F6' },
  { name: 'Transport', value: 80000, display: 'Rp80.000', color: '#93C5FD' },
  { name: 'Kuliah', value: 165000, display: 'Rp165.000', color: '#1D4ED8' },
  { name: 'Hiburan', value: 155000, display: 'Rp155.000', color: '#BFDBFE' },
];

export default function DonutChart() {
  return (
    <div className="flex items-center justify-between">
      <div className="w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataKategoriDonut}
              innerRadius={30}
              outerRadius={45}
              paddingAngle={2}
              dataKey="value"
            >
              {dataKategoriDonut.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => `Rp${val.toLocaleString('id-ID')}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5 text-xs flex-1 ml-4">
        {dataKategoriDonut.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="font-bold text-gray-900">{item.display}</span>
          </div>
        ))}
      </div>
    </div>
  );
}