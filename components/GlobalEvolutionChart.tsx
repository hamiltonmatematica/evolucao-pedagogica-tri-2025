import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GlobalStats } from '../types';

interface Props {
  data: GlobalStats[];
}

const GlobalEvolutionChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Curva de Aprendizado Institucional (Média TRI)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTri" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="examName" stroke="#888" tick={{fontSize: 10}} interval={0} />
          <YAxis domain={['dataMin - 50', 'dataMax + 50']} stroke="#888" />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="averageTri" 
            name="Média TRI Global" 
            stroke="#1e40af" 
            fillOpacity={1} 
            fill="url(#colorTri)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlobalEvolutionChart;