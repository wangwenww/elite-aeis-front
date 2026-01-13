import http from './http';
import { STUDENT_API } from '../API_Interfaces';

export const studentApi = {
    /**
     * 获取学生列表
     * @returns {Promise<any>} 学生列表响应
     */
    getStudents() {
        return http.get(STUDENT_API.GET_STUDENTS);
    },

    /**
     * 获取单个学生详情
     * @param {number} id - 学生ID
     * @returns {Promise<any>} 学生详情
     */
    getStudent(id) {
        return http.get(STUDENT_API.GET_STUDENT(id));
    },

    /**
     * 创建学生
     * @param {Object} data - 学生数据
     * @param {string} data.name - The name of the student (required)
     * @param {string} [data.email] - The email address of the student
     * @param {string} [data.phone] - The phone number of the student
     * @param {string} [data.grade] - The grade/level of the student
     * @param {string} [data.className] - The class name of the student
     * @returns {Promise<any>} 创建结果
     */
    createStudent(data) {
        return http.post(STUDENT_API.CREATE_STUDENT, data);
    },

    /**
     * 更新学生
     * @param {number} id - 学生ID
     * @param {Object} data - 学生数据
     * @param {string} data.name - The name of the student (required)
     * @param {string} [data.email] - The email address of the student
     * @param {string} [data.phone] - The phone number of the student
     * @param {string} [data.grade] - The grade/level of the student
     * @param {string} [data.className] - The class name of the student
     * @returns {Promise<any>} 更新结果
     */
    updateStudent(id, data) {
        return http.put(STUDENT_API.UPDATE_STUDENT(id), data);
    },

    /**
     * 删除学生
     * @param {number} id - 学生ID
     * @returns {Promise<any>} 删除结果
     */
    deleteStudent(id) {
        return http.delete(STUDENT_API.DELETE_STUDENT(id));
    }
};
