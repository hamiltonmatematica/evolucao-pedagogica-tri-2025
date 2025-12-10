import { GoogleGenAI } from "@google/genai";
import { Area, GlobalStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPedagogicalAnalysis = async (stats: GlobalStats[], area: Area) => {
  const model = "gemini-2.5-flash";
  
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
    return "Análise executiva indisponível no momento.";
  }
};