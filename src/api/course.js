import http from './http';
import { COURSE_API } from '../API_Interfaces';

export const courseApi = {
    /**
     * 获取课程列表
     * @returns {Promise<any>} 课程列表响应
     */
    getCourses() {
        return http.get(COURSE_API.GET_COURSES);
    },

    /**
     * 创建课程
     * @param {Object} data - 课程数据
     * @param {string} data.name - The name of the course (required)
     * @param {string} data.time - The time of the course (required)
     * @param {number} data.price - The price of the course (required)
     * @param {string} data.currency - The currency code (default: CNY)
     * @param {string} data.css_class - The CSS class for styling
     * @param {string} [data.description] - The description of the course
     * @returns {Promise<any>} 创建结果
     */
    createCourse(data) {
        return http.post(COURSE_API.CREATE_COURSE, data);
    },

    /**
     * 更新课程
     * @param {number} id - 课程ID
     * @param {Object} data - 课程数据
     * @param {string} data.name - The name of the course (required)
     * @param {string} data.time - The time of the course (required)
     * @param {number} data.price - The price of the course (required)
     * @param {string} data.currency - The currency code (default: CNY)
     * @param {string} data.css_class - The CSS class for styling
     * @param {string} [data.description] - The description of the course
     * @returns {Promise<any>} 更新结果
     */
    updateCourse(id, data) {
        return http.put(COURSE_API.UPDATE_COURSE(id), data);
    },

    /**
     * 删除课程
     * @param {number} id - 课程ID
     * @returns {Promise<any>} 删除结果
     */
    deleteCourse(id) {
        return http.delete(COURSE_API.DELETE_COURSE(id));
    }
};