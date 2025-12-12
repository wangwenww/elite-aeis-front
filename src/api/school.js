import http from './http';
import { CLASS_API } from '../API_Interfaces';

export const schoolApi = {
    /**
     * 班级管理 - 获取班级列表
     * @param {Object} params - 查询参数
     * @returns {Promise<any>} 班级列表
     */
    getClasses(params) {
        return http.get(CLASS_API.GET_CLASSES, { params });
    },

    /**
     * 创建班级
     * @param {Object} data - 班级数据
     * @param {string} data.name - The name of the class (required)
     * @param {string} [data.description] - The description of the class
     * @returns {Promise<any>} 创建结果
     */
    createClass(data) {
        return http.post(CLASS_API.CREATE_CLASS, data);
    },

    /**
     * 更新班级
     * @param {number} id - 班级ID
     * @param {Object} data - 班级数据
     * @param {string} data.name - The name of the class (required)
     * @param {string} [data.description] - The description of the class
     * @returns {Promise<any>} 更新结果
     */
    updateClass(id, data) {
        return http.put(CLASS_API.UPDATE_CLASS(id), data);
    },

    /**
     * 删除班级
     * @param {number} id - 班级ID
     * @returns {Promise<any>} 删除结果
     */
    deleteClass(id) {
        return http.delete(CLASS_API.DELETE_CLASS(id));
    },

    /**
     * 获取班级详情
     * @param {number} id - 班级ID
     * @returns {Promise<any>} 班级详情
     */
    getClassDetails(id) {
        return http.get(CLASS_API.GET_CLASS_DETAILS(id));
    },

    /**
     * 学生分班 - 添加学生到班级
     * @param {number} classId - 班级ID
     * @param {number} studentId - 学生ID
     * @returns {Promise<any>} 添加结果
     */
    addStudentToClass(classId, studentId) {
        return http.post(CLASS_API.ADD_STUDENT_TO_CLASS(classId, studentId));
    },

    /**
     * 移除班级中的学生
     * @param {number} classId - 班级ID
     * @param {number} studentId - 学生ID
     * @returns {Promise<any>} 移除结果
     */
    removeStudentFromClass(classId, studentId) {
        return http.delete(CLASS_API.REMOVE_STUDENT_FROM_CLASS(classId, studentId));
    }
};
