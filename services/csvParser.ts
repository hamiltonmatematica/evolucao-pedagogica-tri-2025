import { Area, Student, ExamResult, SkillData } from '../types';

// CSV file configurations
const CSV_FILES = [
    {
        path: '/RESULTADO  ABRIL DIA 1.csv',
        examId: 'abril',
        examName: '1. Simulado Abril',
        date: 'Abril 2025',
        areas: [Area.LINGUAGENS, Area.HUMANAS]
    },
    {
        path: '/RESULTADO ABRIL DIA 2.csv',
        examId: 'abril',
        examName: '1. Simulado Abril',
        date: 'Abril 2025',
        areas: [Area.NATUREZA, Area.MATEMATICA]
    },
    {
        path: '/RESULTADO JUNHO DIA 1.csv',
        examId: 'junho',
        examName: '2. Simulado Junho',
        date: 'Junho 2025',
        areas: [Area.LINGUAGENS, Area.HUMANAS]
    },
    {
        path: '/RESULTADO JUNHO DIA 2 .csv',
        examId: 'junho',
        examName: '2. Simulado Junho',
        date: 'Junho 2025',
        areas: [Area.NATUREZA, Area.MATEMATICA]
    },
    {
        path: '/RESULTADO AGOSTO DIA 1.csv',
        examId: 'agosto',
        examName: '3. Simulado Agosto',
        date: 'Agosto 2025',
        areas: [Area.LINGUAGENS, Area.HUMANAS]
    },
    {
        path: '/RESULTADO AGOSTO DIA 2.csv',
        examId: 'agosto',
        examName: '3. Simulado Agosto',
        date: 'Agosto 2025',
        areas: [Area.NATUREZA, Area.MATEMATICA]
    },
    {
        path: '/RESULTADO SETEMBRO dia 1.csv',
        examId: 'setembro',
        examName: '4. Simulado Setembro',
        date: 'Setembro 2025',
        areas: [Area.LINGUAGENS, Area.HUMANAS]
    },
    {
        path: '/RESULTADO SETEMBRO dia 2xlsx.csv',
        examId: 'setembro',
        examName: '4. Simulado Setembro',
        date: 'Setembro 2025',
        areas: [Area.NATUREZA, Area.MATEMATICA]
    },
    {
        path: '/Simulado OUTUBRO DIA 1.csv',
        examId: 'outubro',
        examName: '5. Simulado Outubro',
        date: 'Outubro 2025',
        areas: [Area.LINGUAGENS, Area.HUMANAS]
    },
    {
        path: '/Simulado OUTUBRO DIA 2.csv',
        examId: 'outubro',
        examName: '5. Simulado Outubro',
        date: 'Outubro 2025',
        areas: [Area.NATUREZA, Area.MATEMATICA]
    }
];

// Area name mapping from CSV to enum
const AREA_MAP: { [key: string]: Area } = {
    'LINGUAGENS': Area.LINGUAGENS,
    'HUMANIDADES': Area.HUMANAS,
    'NATUREZA': Area.NATUREZA,
    'MATEMÁTICA': Area.MATEMATICA
};

// Helper to normalize decimal separator (comma to dot)
const parseFloat2 = (value: string): number => {
    if (!value || value.trim() === '') return 0;
    return parseFloat(value.replace(',', '.'));
};

// Parse a single CSV file
async function parseCSVFile(filePath: string, examId: string, examName: string, date: string, expectedAreas: Area[]): Promise<Map<string, Partial<ExamResult>>> {
    const studentDataMap = new Map<string, Partial<ExamResult>>();

    try {
        const response = await fetch(filePath);
        let text = await response.text();

        // Remove BOM if present
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.substring(1);
        }

        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (lines.length < 10) {
            console.warn(`CSV file ${filePath} has insufficient lines`);
            return studentDataMap;
        }

        // Line 1: Student names
        const nameRow = lines[0].split(';');
        const studentNames = nameRow.slice(1); // Skip "NOME" header

        // Initialize student data
        studentNames.forEach(name => {
            if (name && name.trim() !== '') {
                studentDataMap.set(name.trim(), {
                    examId,
                    examName,
                    date,
                    areas: {}
                });
            }
        });

        // Skip COLOCAÇÃO and MÉDIA GERAL lines (lines 1 and 2)
        // Start at line 3 where first area header is
        let currentLineIndex = 3;

        // Process each area in the file
        for (const expectedArea of expectedAreas) {
            // Find the area header line
            let foundArea: Area | null = null;
            let areaStartIndex = -1;

            while (currentLineIndex < lines.length) {
                const areaRow = lines[currentLineIndex].split(';');
                const areaHeader = areaRow[0]?.trim().toUpperCase();

                if (AREA_MAP[areaHeader]) {
                    foundArea = AREA_MAP[areaHeader];
                    // Check if this is one of the expected areas
                    if (foundArea === expectedArea) {
                        areaStartIndex = currentLineIndex;
                        break;
                    }
                }
                currentLineIndex++;
            }

            if (areaStartIndex === -1 || foundArea !== expectedArea) {
                console.warn(`Area ${expectedArea} not found in ${filePath}`);
                continue;
            }

            // Now we're at the area header line
            currentLineIndex = areaStartIndex + 1; // Move to ACERTOS line

            if (currentLineIndex >= lines.length) break;
            const acertosRow = lines[currentLineIndex].split(';');
            currentLineIndex++; // Move to NOTA line

            if (currentLineIndex >= lines.length) break;
            const notaRow = lines[currentLineIndex].split(';');
            currentLineIndex++; // Move to H01

            // Parse skills H01-H30
            const skillRows: string[][] = [];
            for (let i = 0; i < 30 && currentLineIndex < lines.length; i++) {
                const skillRow = lines[currentLineIndex].split(';');
                skillRows.push(skillRow);
                currentLineIndex++;
            }

            // Now assign data to each student
            studentNames.forEach((name, index) => {
                const studentIndex = index + 1; // +1 because first column is header
                const studentData = studentDataMap.get(name.trim());

                if (!studentData || !studentData.areas) return;

                const rawScoreStr = acertosRow[studentIndex];
                const triScoreStr = notaRow[studentIndex];

                // Skip if no data
                if (!rawScoreStr || !triScoreStr || rawScoreStr.trim() === '' || triScoreStr.trim() === '') {
                    return; // Student was absent for this area
                }

                const rawScore = parseInt(rawScoreStr.trim());
                const triScore = parseFloat2(triScoreStr.trim());

                // Parse skills
                const skills: SkillData[] = [];
                for (let i = 0; i < 30; i++) {
                    const skillId = `H${(i + 1).toString().padStart(2, '0')}`;
                    const probabilityStr = skillRows[i]?.[studentIndex];
                    const probability = probabilityStr ? parseFloat2(probabilityStr.trim()) : 0;

                    skills.push({
                        id: skillId,
                        probability: Math.min(100, Math.max(0, probability))
                    });
                }

                studentData.areas![expectedArea] = {
                    rawScore: isNaN(rawScore) ? 0 : rawScore,
                    triScore: isNaN(triScore) ? 0 : triScore,
                    skills
                };
            });

            // Skip separator line and move to next area
            currentLineIndex++;
        }

    } catch (error) {
        console.error(`Error parsing CSV file ${filePath}:`, error);
    }

    return studentDataMap;
}

// Main function to load all student data
export async function loadAllStudentData(): Promise<Student[]> {
    const studentMap = new Map<string, Student>();

    // Process each CSV file
    for (const csvConfig of CSV_FILES) {
        const examData = await parseCSVFile(
            csvConfig.path,
            csvConfig.examId,
            csvConfig.examName,
            csvConfig.date,
            csvConfig.areas
        );

        // Merge data into student map
        examData.forEach((examResult, studentName) => {
            let student = studentMap.get(studentName);

            if (!student) {
                // Create new student
                student = {
                    id: (studentMap.size + 1).toString(),
                    name: studentName,
                    results: []
                };
                studentMap.set(studentName, student);
            }

            // Check if we already have a result for this exam
            let existingResult = student.results.find(r => r.examId === examResult.examId);

            if (existingResult) {
                // Merge areas into existing result
                Object.assign(existingResult.areas, examResult.areas);
            } else {
                // Add new result
                student.results.push(examResult as ExamResult);
            }
        });
    }

    return Array.from(studentMap.values());
}
