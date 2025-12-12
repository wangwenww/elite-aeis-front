/**
 * Type definitions for class-related data
 */

/**
 * @typedef {Object} Class
 * @property {number} id - The unique identifier of the class
 * @property {string} name - The name of the class
 * @property {string} [description] - The description of the class
 * @property {number} [studentCount] - The number of students in the class
 * @property {Date} [createdAt] - The creation date of the class
 * @property {Date} [updatedAt] - The last update date of the class
 */

/**
 * @typedef {Object} ClassListResponse
 * @property {Class[]} classes - Array of class objects
 * @property {number} count - The total count of classes
 */

/**
 * @typedef {Object} CreateClassRequest
 * @property {string} name - The name of the class (required)
 * @property {string} [description] - The description of the class
 */

/**
 * @typedef {Object} AddStudentToClassRequest
 * @property {number} classId - The ID of the class
 * @property {number} studentId - The ID of the student
 */