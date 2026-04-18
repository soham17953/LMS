/**
 * Valid subjects for a student by medium and standard (class).
 * @param {string} medium - "English" | "Marathi"
 * @param {number|string} standard - class number (e.g. 3–10)
 * @returns {string[]}
 */
export function getSubjects(medium, standard) {
  const std = Number(standard);
  if (Number.isNaN(std)) return [];

  if (medium === 'English') {
    return ['Maths', 'Science', 'English', 'Social Studies'];
  }

  if (medium === 'Marathi') {
    if (std === 3 || std === 4) {
      return ['Maths', 'EVS', 'Marathi'];
    }
    if (std >= 5 && std <= 10) {
      return ['Maths', 'Science', 'Marathi', 'Social Studies'];
    }
  }

  return [];
}
