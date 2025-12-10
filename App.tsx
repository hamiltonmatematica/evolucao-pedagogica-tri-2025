import React, { useState, useEffect } from 'react';
import { getStudents, getGlobalStats, getGlobalSkillMatrix } from './services/dataService';
import { getPedagogicalAnalysis } from './services/geminiService';
import { Area, Student } from './types';
import StatCard from './components/StatCard';
import GlobalEvolutionChart from './components/GlobalEvolutionChart';
import ScoreEvolutionChart from './components/ScoreEvolutionChart';
import SkillHeatmap from './components/SkillHeatmap';
import { TrendingUp, User, ChevronDown, Sparkles, PieChart, Users, CheckCircle, ArrowRight, BarChart3, GraduationCap, Target, Brain, FileText } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [selectedArea, setSelectedArea] = useState<Area>(Area.MATEMATICA);
  const [globalAnalysis, setGlobalAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Student view state (Reference Case Studies)
  const students = getStudents();
  const [selectedReferenceStudent, setSelectedReferenceStudent] = useState<Student>(students[0]);

  // Data
  const globalStats = getGlobalStats(selectedArea);
  const globalSkills = getGlobalSkillMatrix(selectedArea);
  
  // Student specific data for current selection
  const lastValidResult = [...selectedReferenceStudent.results].reverse().find(r => r.areas[selectedArea]);
  const studentSkills = lastValidResult?.areas[selectedArea]?.skills || [];
  
  const initialStat = globalStats[0];
  const finalStat = globalStats[globalStats.length - 1];
  const growth = finalStat.averageTri - initialStat.averageTri;
  const growthPercent = ((growth / initialStat.averageTri) * 100).toFixed(1);

  const handleGenerateAnalysis = async () => {
    setLoadingAnalysis(true);
    const text = await getPedagogicalAnalysis(globalStats, selectedArea);
    setGlobalAnalysis(text);
    setLoadingAnalysis(false);
  };

  useEffect(() => {
    setGlobalAnalysis(null);
    handleGenerateAnalysis(); // Auto generate on area change for presentation flow
  }, [selectedArea]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      
      {/* 1. Hero / Header Section */}
      <div className="bg-slate-900 text-white pt-6 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold tracking-wide text-blue-100">Analytics Pedagógico 2025</span>
            </div>
            <div className="text-sm text-slate-400">Dados consolidados: Nov/2025</div>
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs font-medium uppercase tracking-wider">
              <CheckCircle size={12} /> Metodologia Comprovada
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Evolução Consolidada do Aprendizado
            </h1>
            <p className="text-lg text-slate-300">
              Apresentação de impacto da metodologia de ciclos avaliativos contínuos.
              Dados baseados na evolução TRI de <span className="text-white font-bold">{students.length} alunos</span> ao longo de 5 simulados.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container (Overlapping Hero) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 space-y-12">
        
        {/* Filter Area */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex overflow-x-auto justify-center">
           {Object.values(Area).map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                  selectedArea === area 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {area}
              </button>
            ))}
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Crescimento Global (Média TRI)"
            value={`+${growth.toFixed(1)}`}
            subtitle="Pontos de evolução na média da turma"
            trend="up"
            trendValue={`${growthPercent}%`}
            icon={<TrendingUp size={24} />}
            color="bg-white"
          />
          <StatCard 
            title="Aproveitamento Final"
            value={finalStat.averageTri}
            subtitle="Média TRI no simulado final"
            trend="up"
            trendValue="Meta Superada"
            icon={<Target size={24} />}
            color="bg-white"
          />
          {/* Expanded AI Analysis Card - Now spans 2 columns on large screens */}
           <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-xl shadow-md p-6 text-white relative overflow-hidden group flex flex-col h-full">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 border-b border-indigo-400/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Sparkles size={18} className="text-yellow-300" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-indigo-100">Parecer Executivo IA</span>
                </div>
                <div className="bg-indigo-900/50 px-3 py-1 rounded text-xs text-indigo-200 border border-indigo-500/30">
                  Relatório Dinâmico
                </div>
              </div>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar min-h-[120px]">
                {loadingAnalysis ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-80">
                    <Sparkles className="animate-spin text-yellow-300" size={24} />
                    <span className="animate-pulse text-sm">Analisando dados da cohort...</span>
                  </div>
                ) : (
                  globalAnalysis ? (
                     <div className="text-sm md:text-base leading-relaxed text-indigo-50 font-light" dangerouslySetInnerHTML={{ __html: globalAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
                  ) : "Gerando insights..."
                )}
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Section: Methodology Vizualization */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
           <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Ciclo de Potencialização de Resultados</h2>
              <p className="text-gray-500 mt-2">Como garantimos a evolução constante entre os 5 marcos avaliativos</p>
           </div>
           
           <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
              {/* Line Connector (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0"></div>

              {[
                { title: "Diagnóstico", desc: "Março", icon: Users },
                { title: "Intervenção", desc: "Abr-Mai", icon: Brain },
                { title: "Verificação", desc: "Julho", icon: CheckCircle },
                { title: "Intensivo", desc: "Set-Out", icon: TrendingUp },
                { title: "Resultado", desc: "Novembro", icon: GraduationCap },
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center bg-white p-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md border-2 ${idx === 4 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-100 text-blue-600'}`}>
                    <step.icon size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{step.title}</h4>
                  <span className="text-xs text-gray-400">{step.desc}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Section: Global Data Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GlobalEvolutionChart data={globalStats} />
            <p className="mt-4 text-sm text-gray-500 italic">
              * O gráfico demonstra a consistência da evolução da média geral da turma. Note a aceleração do crescimento após o ciclo intensivo (Simulado 4).
            </p>
          </div>
          <div className="lg:col-span-1">
             <SkillHeatmap skills={globalSkills} title="Matriz de Competências (Média Global)" />
          </div>
        </div>

        {/* Section: Individual Case Studies (Proof) */}
        <div className="pt-12 border-t border-gray-200">
           <div className="flex flex-col md:flex-row justify-between items-end mb-8">
             <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="text-blue-600" />
                  Casos de Referência (Microdados)
                </h2>
                <p className="text-gray-500 mt-2 max-w-2xl">
                  Para validar a estatística global, analisamos individualmente o impacto em perfis distintos de alunos.
                  Selecione um aluno para ver o comparativo detalhado.
                </p>
             </div>
             
             {/* Student Selector */}
             <div className="relative group mt-4 md:mt-0 z-50">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 w-64 justify-between">
                  <span className="flex items-center gap-2 truncate">
                    <User size={16} />
                    {selectedReferenceStudent.name}
                  </span>
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block max-h-80 overflow-y-auto">
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedReferenceStudent(s)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-50 last:border-0"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Top Row: Charts & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ScoreEvolutionChart student={selectedReferenceStudent} globalStats={globalStats} area={selectedArea} />
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                     <FileText size={20} className="text-blue-600" />
                     Análise Evolutiva Individual
                   </h3>
                   
                   {/* Handle absent stats gracefully */}
                   {(() => {
                     const firstValid = selectedReferenceStudent.results.find(r => r.areas[selectedArea]);
                     const lastValid = [...selectedReferenceStudent.results].reverse().find(r => r.areas[selectedArea]);
                     
                     if (!firstValid || !lastValid) return <p className="text-gray-500">Dados insuficientes para análise de evolução deste aluno.</p>;

                     return (
                      <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-50 p-4 rounded-lg text-center">
                            <span className="block text-xs text-gray-500 uppercase">Nota Inicial</span>
                            <span className="text-xl font-bold text-gray-700">
                              {firstValid.areas[selectedArea]?.triScore}
                            </span>
                            <span className="block text-[10px] text-gray-400 mt-1">{firstValid.examName}</span>
                          </div>
                          <div className="text-gray-300"><ArrowRight /></div>
                          <div className="flex-1 bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                            <span className="block text-xs text-blue-600 uppercase">Nota Final</span>
                            <span className="text-xl font-bold text-blue-700">
                              {lastValid.areas[selectedArea]?.triScore}
                            </span>
                            <span className="block text-[10px] text-blue-400 mt-1">{lastValid.examName}</span>
                          </div>
                      </div>
                     );
                   })()}

                   <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                     <h4 className="text-sm font-bold text-yellow-800 mb-1">Diagnóstico Comparativo</h4>
                     <p className="text-sm text-yellow-900/80 leading-relaxed">
                       A linha <span className="text-gray-500 font-bold border-b border-gray-400 border-dashed">Cinza Tracejada</span> no gráfico ao lado representa a média geral da cohort (60 alunos). 
                       Isso permite identificar se {selectedReferenceStudent.name.split(' ')[0]} está performando acima ou abaixo da média institucional em cada etapa do ciclo.
                     </p>
                   </div>
                </div>
              </div>

              {/* Bottom Row: Heatmaps (Side by Side) */}
              <div className="border-t border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-800">Diagnóstico de Habilidades: Aluno vs Turma</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div>
                             <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">Aluno: {selectedReferenceStudent.name}</span>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{lastValidResult?.examName || 'N/A'}</span>
                             </div>
                             <SkillHeatmap skills={studentSkills} title="Matriz Individual" />
                        </div>
                        <div>
                             <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">Referência: Média Global</span>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Consolidado Final</span>
                             </div>
                             <SkillHeatmap skills={globalSkills} title="Matriz da Turma" />
                        </div>
                    </div>
                  </div>
                   <p className="text-xs text-gray-400 mt-4 text-center">
                      * Comparativo visual da proficiência em cada uma das 30 habilidades. Cores mais escuras indicam maior domínio.
                   </p>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;