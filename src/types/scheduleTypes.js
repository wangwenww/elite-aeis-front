/**
 * Type definitions for schedule-related data
 */

/**
 * @typedef {Object} ScheduleSnapshot
 * @property {number} id - The unique identifier of the snapshot
 * @property {number} studentId - The ID of the student
 * @property {string} yearMonth - The year and month in YYYY-MM format
 * @property {Object} scheduleData - The schedule data containing lessons and expenses
 * @property {Object} scheduleData.lessons - The lessons data
 * @property {Object} scheduleData.extraExpenses - The extra expenses data
 * @property {Date} [createdAt] - The creation date of the snapshot
 * @property {Date} [updatedAt] - The last update date of the snapshot
 */

/**
 * @typedef {Object} SaveSnapshotRequest
 * @property {number} student_id - The ID of the student (required)
 * @property {string} year_month - The year and month in YYYY-MM format (required)
 * @property {Object} schedule_data - The schedule data (required)
 */

/**
 * @typedef {Object} SaveSnapshotResponse
 * @property {boolean} success - Whether the save was successful
 * @property {string} message - A message about the result
 */