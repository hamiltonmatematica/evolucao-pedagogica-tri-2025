import { GoogleGenAI } from "@google/genai";
import { Area, GlobalStats } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || "" });

export const getPedagogicalAnalysis = async (stats: GlobalStats[], area: Area) => {
  const model = "gemini-1.5-flash";

  const statsString = stats.map(s =>
    `${s.examName} (${s.date}): Média TRI ${s.averageTri}, Média Acertos ${s.averageRaw}, >800: ${s.proficiencyDistribution.above800} alunos`
  ).join('\n');

  const prompt = `
    Atue como um Consultor Sênior de Inteligência Pedagógica apresentando resultados para a diretoria de uma rede de ensino.
    
    O objetivo é provar, através dos dados, que a metodologia de ciclos de simulados + intervenção individualizada funcionou em 2025.
    
    Área Analisada: ${area}
    
    Dados da Evolução Global (Média da Cohort):
    ${statsString}
    
    Escreva um "Sumário Executivo de Impacto" (máximo 150 palavras) que:
    1. Destaque o crescimento percentual ou absoluto da média TRI do início ao fim do ano.
    2. Enfatize a eficácia das intervenções realizadas entre os simulados (os dados mostram crescimento constante).
    3. Use linguagem corporativa/pedagógica de alto nível (ex: "consolidação de competências", "ganho de proficiência", "ROI educacional").
    
    Não use saudações. Vá direto ao ponto. Use formatação Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar análise Gemini:", error);

    // Fallback: criar uma análise básica com os dados disponíveis
    const firstExam = stats[0];
    const lastExam = stats[stats.length - 1];
    const growth = ((lastExam.averageTri - firstExam.averageTri) / firstExam.averageTri * 100).toFixed(1);

    return `## Análise Executiva - ${area}

**Evolução Demonstrada**: A cohort apresentou crescimento de **${growth}%** na média TRI, partindo de ${firstExam.averageTri.toFixed(1)} em ${firstExam.examName} e atingindo ${lastExam.averageTri.toFixed(1)} em ${lastExam.examName}.

**Impacto das Intervenções**: O ciclo de simulados seguido de intervenções pedagógicas individualizadas resultou em consolidação progressiva de competências ao longo de 2025.

**Proficiência**: Aumento de ${((lastExam.proficiencyDistribution.above800 - firstExam.proficiencyDistribution.above800) / stats.length * 100).toFixed(0)}% no número de alunos com TRI >800, evidenciando o ROI educacional da metodologia aplicada.

*Nota: Análise gerada automaticamente. API Gemini temporariamente indisponível.*`;
  }
};