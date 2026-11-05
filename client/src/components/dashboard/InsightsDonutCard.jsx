import React from 'react';
import { BarChart2, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const InsightsDonutCard = ({ distribution = [], totalApplications = 0 }) => {
  const hasData = totalApplications > 0 && distribution.length > 0;

  const data = hasData
    ? distribution
    : [{ name: 'Pending', value: 1, percent: 100, color: '#EDE8FC' }];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EDE8FF] flex items-center justify-center text-[#7652E8] shrink-0">
            <BarChart2 className="w-4 h-4 text-[#7652E8]" />
          </div>
          <h3 className="text-sm font-black text-[#17172F]">Application Insights</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-[#74748C] font-semibold cursor-pointer hover:text-[#17172F] transition-colors">
          <span>This Month</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex items-center justify-between mt-2 gap-3 flex-1">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={54}
                paddingAngle={hasData ? 4 : 0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-[#17172F] font-sans leading-none">
              {totalApplications}
            </span>
            <span className="text-[10px] font-bold text-[#8E8BA8] mt-1 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 pl-3 min-w-0">
          {hasData ? (
            data.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate pr-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: item.color }} />
                  <span className="text-[#17172F] text-[11px] font-semibold truncate">{item.name}</span>
                </div>
                <span className="text-[#17172F] text-[11px] font-black shrink-0">{item.percent}%</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#8E8BA8] font-medium leading-relaxed">
              Status distribution percentages calculate automatically as applications are added.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsDonutCard;
