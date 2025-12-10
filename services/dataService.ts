import { Area, Student, GlobalStats } from '../types';
// import { loadAllStudentData } from './csvParser';

// TEMPORARY: Using mock data while CSV parser is being fixed
const generateMockData = (): Student[] => {
  const students: Student[] = [];
  const exams = [
    { examId: 'abril', examName: '1. Simulado Abril', date: 'Abril 2025' },
    { examId: 'junho', examName: '2. Simulado Junho', date: 'Junho 2025' },
    { examId: 'agosto', examName: '3. Simulado Agosto', date: 'Agosto 2025' },
    { examId: 'setembro', examName: '4. Simulado Setembro', date: 'Setembro 2025' },
    { examId: 'outubro', examName: '5. Simulado Outubro', date: 'Outubro 2025' }
  ];

  for (let i = 0; i < 30; i++) {
    const student: Student = {
      id: (i + 1).toString(),
      name: `Aluno ${i + 1}`,
      results: []
    };

    exams.forEach((exam, examIndex) => {
      const baseScore = 500 + Math.random() * 200 + (examIndex * 20); // Evolução ao longo dos simulados

      const areas: any = {};

      [Area.LINGUAGENS, Area.HUMANAS, Area.NATUREZA, Area.MATEMATICA].forEach(area => {
        const areaBaseScore = baseScore + (Math.random() * 100 - 50);
        const skills = [];

        for (let skillNum = 1; skillNum <= 30; skillNum++) {
          skills.push({
            id: `H${skillNum.toString().padStart(2, '0')}`,
            probability: Math.min(100, Math.max(30, 50 + Math.random() * 30 + (examIndex * 5)))
          });
        }

        areas[area] = {
          rawScore: Math.floor(20 + Math.random() * 25),
          triScore: Math.round(areaBaseScore * 10) / 10,
          skills
        };
      });

      student.results.push({
        examId: exam.examId,
        examName: exam.examName,
        date: exam.date,
        areas
      });
    });

    students.push(student);
  }

  return students;
};

// Cache for loaded student data
let studentsCache: Student[] | null = null;
let loadingPromise: Promise<Student[]> | null = null;

// Load student data from CSV files
const loadStudents = async (): Promise<Student[]> => {
  if (studentsCache) {
    return studentsCache;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  // TEMPORARY: Use mock data instead of CSV
  loadingPromise = Promise.resolve(generateMockData());
  studentsCache = await loadingPromise;
  loadingPromise = null;

  return studentsCache;
};

// Synchronous access - returns empty array if not loaded yet
export const getStudents = (): Student[] => {
  if (!studentsCache) {
    // Trigger async load
    loadStudents().catch(err => console.error('Error loading students:', err));
    return [];
  }
  return studentsCache;
};

export const getStudentById = (id: string): Student | undefined => {
  return getStudents().find(s => s.id === id);
};

export const getGlobalStats = (area: Area): GlobalStats[] => {
  const students = getStudents();

  if (students.length === 0) {
    return [];
  }

  // Get unique exam IDs from all student results
  const examMap = new Map<string, { examId: string; examName: string; date: string }>();

  students.forEach(student => {
    student.results.forEach(result => {
      if (!examMap.has(result.examId)) {
        examMap.set(result.examId, {
          examId: result.examId,
          examName: result.examName,
          date: result.date
        });
      }
    });
  });

  const exams = Array.from(examMap.values());

  // Sort exams chronologically
  const examOrder = ['abril', 'junho', 'agosto', 'setembro', 'outubro'];
  exams.sort((a, b) => {
    const indexA = examOrder.indexOf(a.examId);
    const indexB = examOrder.indexOf(b.examId);
    return indexA - indexB;
  });

  return exams.map(exam => {
    let totalTri = 0;
    let totalRaw = 0;
    let studentCount = 0;

    const distribution = {
      below500: 0,
      range500to600: 0,
      range600to700: 0,
      range700to800: 0,
      above800: 0,
    };

    students.forEach(student => {
      const result = student.results.find(r => r.examId === exam.examId);
      const areaData = result?.areas[area];

      if (areaData && areaData.triScore > 0) {
        studentCount++;
        totalTri += areaData.triScore;
        totalRaw += areaData.rawScore;

        if (areaData.triScore < 500) distribution.below500++;
        else if (areaData.triScore < 600) distribution.range500to600++;
        else if (areaData.triScore < 700) distribution.range600to700++;
        else if (areaData.triScore < 800) distribution.range700to800++;
        else distribution.above800++;
      }
    });

    return {
      examName: exam.examName,
      date: exam.date,
      averageTri: studentCount > 0 ? parseFloat((totalTri / studentCount).toFixed(1)) : 0,
      averageRaw: studentCount > 0 ? parseFloat((totalRaw / studentCount).toFixed(1)) : 0,
      proficiencyDistribution: distribution
    };
  });
};

export const getGlobalSkillMatrix = (area: Area) => {
  const students = getStudents();

  if (students.length === 0) {
    // Return empty matrix
    const matrix = [];
    for (let i = 1; i <= 30; i++) {
      matrix.push({
        id: `H${i.toString().padStart(2, '0')}`,
        probability: 0
      });
    }
    return matrix;
  }

  // Use the last exam (outubro)
  const skillSums: { [key: string]: number } = {};
  let studentCount = 0;

  students.forEach(student => {
    // Find the most recent result with data for this area
    const resultWithArea = [...student.results].reverse().find(r => r.areas[area]);
    const skills = resultWithArea?.areas[area]?.skills;

    if (skills && skills.length > 0) {
      studentCount++;
      skills.forEach(skill => {
        skillSums[skill.id] = (skillSums[skill.id] || 0) + skill.probability;
      });
    }
  });

  const matrix = [];
  for (let i = 1; i <= 30; i++) {
    const id = `H${i.toString().padStart(2, '0')}`;
    matrix.push({
      id,
      probability: studentCount > 0 ? parseFloat((skillSums[id] / studentCount).toFixed(2)) : 0
    });
  }
  return matrix;
};

// Initialize data loading
loadStudents().catch(err => console.error('Failed to load student data:', err));