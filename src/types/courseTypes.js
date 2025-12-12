/**
 * Type definitions for course-related data
 */

/**
 * @typedef {Object} Course
 * @property {number} id - The unique identifier of the course
 * @property {string} name - The name of the course
 * @property {string} time - The time of the course
 * @property {number} price - The price of the course
 * @property {string} currency - The currency for the price
 * @property {string} css_class - The CSS class for styling
 * @property {string} [description] - The description of the course
 * @property {Date} [createdAt] - The creation date of the course
 * @property {Date} [updatedAt] - The last update date of the course
 */

/**
 * @typedef {Object} CourseListResponse
 * @property {Course[]} courses - Array of course objects
 * @property {number} count - The total count of courses
 */

/**
 * @typedef {Object} CreateCourseRequest
 * @property {string} name - The name of the course (required)
 * @property {string} time - The time of the course (required)
 * @property {number} price - The price of the course (required)
 * @property {string} currency - The currency code (default: CNY)
 * @property {string} css_class - The CSS class for styling
 * @property {string} [description] - The description of the course
 */