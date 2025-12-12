import http from './http';
import { SCHEDULE_API } from '../API_Interfaces';

export const scheduleApi = {
  /**
   * 保存课表快照
   * @param {Object} data - 快照数据
   * @param {number} data.student_id - The ID of the student (required)
   * @param {string} data.year_month - The year and month in YYYY-MM format (required)
   * @param {Object} data.schedule_data - The schedule data (required)
   * @returns {Promise<any>} 保存结果
   */
  saveSnapshot(data) {
    return http.post(SCHEDULE_API.SAVE_SNAPSHOT, data);
  },
};