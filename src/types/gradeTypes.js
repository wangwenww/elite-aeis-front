/**
 * Type definitions for grade-related data
 */

/**
 * @typedef {Object} Grade
 * @property {number} id - The unique identifier of the grade
 * @property {number} studentId - The ID of the student
 * @property {string} subject - The subject of the grade
 * @property {number} score - The score value
 * @property {string} [examType] - The type of exam (e.g. midterm, final)
 * @property {Date} [examDate] - The date of the exam
 * @property {string} [notes] - Additional notes about the grade
 * @property {Date} [createdAt] - The creation date of the grade
 * @property {Date} [updatedAt] - The last update date of the grade
 */

/**
 * @typedef {Object} GradeListResponse
 * @property {Grade[]} grades - Array of grade objects
 * @property {number} count - The total count of grades
 */

/**
 * @typedef {Object} CreateGradeRequest
 * @property {number} studentId - The ID of the student (required)
 * @property {string} subject - The subject of the grade (required)
 * @property {number} score - The score value (required)
 * @property {string} [examType] - The type of exam
 * @property {Date} [examDate] - The date of the exam
 * @property {string} [notes] - Additional notes about the grade
 */

/**
 * @typedef {Object} GetStudentGradesRequest
 * @property {number} studentId - The ID of the student
 */