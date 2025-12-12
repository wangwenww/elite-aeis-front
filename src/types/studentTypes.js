/**
 * Type definitions for student-related data
 */

/**
 * @typedef {Object} Student
 * @property {number} id - The unique identifier of the student
 * @property {string} name - The name of the student
 * @property {string} [email] - The email address of the student
 * @property {string} [phone] - The phone number of the student
 * @property {string} [grade] - The grade/level of the student
 * @property {string} [className] - The class name of the student
 * @property {Date} [createdAt] - The creation date of the student record
 * @property {Date} [updatedAt] - The last update date of the student record
 */

/**
 * @typedef {Object} StudentListResponse
 * @property {Student[]} students - Array of student objects
 * @property {number} count - The total count of students
 */

/**
 * @typedef {Object} CreateStudentRequest
 * @property {string} name - The name of the student (required)
 * @property {string} [email] - The email address of the student
 * @property {string} [phone] - The phone number of the student
 * @property {string} [grade] - The grade/level of the student
 * @property {string} [className] - The class name of the student
 */