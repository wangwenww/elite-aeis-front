import http from './http';

export const gradeApi = {
    // 成绩录入
    createGrade(data) {
        return http.post('/api/grades', data);
    },

    // 获取学生成绩
    getStudentGrades(studentId) {
        return http.get(`/api/grades/student/${studentId}`);
    },

    // 按试卷获取成绩
    getPaperGrades(params) {
        return http.get('/api/grades/paper', { params });
    },

    // AI 自然语言解析
    parseNaturalLanguage(text) {
        return http.post('/api/grades/parse-natural-language', { text });
    }
};
