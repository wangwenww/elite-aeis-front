import http from './http';
import { GRADE_API } from '../API_Interfaces';

export const gradeApi = {
    /**
     * 成绩录入
     * @param {Object} data - 成绩数据
     * @param {number} data.studentId - The ID of the student (required)
     * @param {string} data.subject - The subject of the grade (required)
     * @param {number} data.score - The score value (required)
     * @param {string} [data.examType] - The type of exam
     * @param {Date} [data.examDate] - The date of the exam
     * @param {string} [data.notes] - Additional notes about the grade
     * @returns {Promise<any>} 创建结果
     */
    createGrade(data) {
        return http.post(GRADE_API.CREATE_GRADE, data);
    },

    /**
     * 获取单个成绩详情
     * @param {number} id - 成绩ID
     * @returns {Promise<any>} 成绩详情
     */
    getGrade(id) {
        return http.get(`${GRADE_API.CREATE_GRADE}/${id}`);
    },

    /**
     * 更新成绩
     * @param {number} id - 成绩ID
     * @param {Object} data - 成绩数据
     * @returns {Promise<any>} 更新结果
     */
    updateGrade(id, data) {
        return http.put(`${GRADE_API.CREATE_GRADE}/${id}`, data);
    },

    /**
     * 获取学生成绩
     * @param {number} studentId - 学生ID
     * @returns {Promise<any>} 学生成绩列表
     */
    getStudentGrades(studentId) {
        return http.get(GRADE_API.GET_STUDENT_GRADES(studentId));
    },

    /**
     * 获取学生成绩分析
     * @param {number} studentId - 学生ID
     * @returns {Promise<any>} 学生成绩分析数据
     */
    getStudentGradesAnalysis(studentId) {
        return http.get(GRADE_API.GET_STUDENT_GRADES_ANALYSIS(studentId));
    },

    /**
     * 按试卷获取成绩
     * @param {Object} params - 查询参数
     * @returns {Promise<any>} 试卷成绩列表
     */
    getPaperGrades(params) {
        return http.get(GRADE_API.GET_PAPER_GRADES, { params });
    },

    /**
     * AI 自然语言解析
     * @param {string} text - 要解析的文本
     * @returns {Promise<any>} 解析结果
     */
    parseNaturalLanguage(text) {
        return http.post(GRADE_API.PARSE_NATURAL_LANGUAGE, { text });
    },

    /**
     * 获取所有试卷名称列表
     * @returns {Promise<any>} 试卷名称列表
     */
    getAllPaperNames() {
        return http.get(`${GRADE_API.CREATE_GRADE}/papers/list`);
    },

    /**
     * 获取学生在指定试卷列表中的成绩
     * @param {number} studentId - 学生ID
     * @param {Array<string>} paperNames - 试卷名称列表
     * @returns {Promise<any>} 成绩列表
     */
    getStudentGradesByPapers(studentId, paperNames) {
        return http.post(`${GRADE_API.CREATE_GRADE}/student/${studentId}/papers`, { paper_names: paperNames });
    }
};
