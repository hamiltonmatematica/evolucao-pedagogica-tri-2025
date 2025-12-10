import React from 'react';

interface Props {
  skills: { id: string; probability: number }[];
  title?: string;
}

const SkillHeatmap: React.FC<Props> = ({ skills, title }) => {
  const getCellColor = (prob: number) => {
    if (prob >= 80) return 'bg-emerald-500 text-white';
    if (prob >= 60) return 'bg-emerald-300 text-emerald-900';
    if (prob >= 40) return 'bg-yellow-200 text-yellow-900';
    return 'bg-red-200 text-red-900';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">{title || "Matriz de Habilidades"}</h3>
      </div>
      
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
        {skills.map((skill) => (
          <div 
            key={skill.id} 
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${getCellColor(skill.probability)} transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl hover:z-10 cursor-help relative group`}
          >
            <span className="text-xs font-semibold opacity-70 mb-1">{skill.id}</span>
            <span className="text-sm font-bold">{Math.round(skill.probability)}%</span>
            
            {/* Tooltip */}
            <div className="absolute z-20 w-40 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 pointer-events-none text-center shadow-lg">
              Probabilidade média: {Math.round(skill.probability)}%
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-4 mt-6 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-200 rounded"></div>Crítico</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-200 rounded"></div>Atenção</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-300 rounded"></div>Médio</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded"></div>Dominado</div>
      </div>
    </div>
  );
};

export default SkillHeatmap;