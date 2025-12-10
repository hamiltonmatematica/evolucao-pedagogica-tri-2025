import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Area, Student, GlobalStats } from '../types';

interface Props {
  student: Student;
  globalStats: GlobalStats[];
  area: Area;
}

const ScoreEvolutionChart: React.FC<Props> = ({ student, globalStats, area }) => {
  const data = student.results.map((r, index) => ({
    name: r.examName.split(' ')[1], // e.g., "Diagnóstico"
    tri: r.areas[area]?.triScore ?? null, // Use null for breaks in the line if absent
    acertos: r.areas[area]?.rawScore ?? null,
    mediaTurma: globalStats[index].averageTri
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Evolução da Nota TRI - {area}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#888" tick={{fontSize: 12}} />
          <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 12}} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 45]} stroke="#888" tick={{fontSize: 12}} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="mediaTurma" 
            name="Média da Turma" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="tri" 
            name="Aluno (TRI)" 
            stroke="#2563eb" 
            strokeWidth={3}
            activeDot={{ r: 8 }}
            connectNulls // Optional: connects points if you don't want gaps. Remove to show gaps for absences.
          />
          
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="acertos" 
            name="Aluno (Acertos)" 
            stroke="#10b981" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreEvolutionChart;