import http from './http';

export const schoolApi = {
    // 班级管理
    getClasses(params) {
        return http.get('/api/classes', { params });
    },

    createClass(data) {
        return http.post('/api/classes', data);
    },

    updateClass(id, data) {
        return http.put(`/api/classes/${id}`, data);
    },

    deleteClass(id) {
        return http.delete(`/api/classes/${id}`);
    },

    getClassDetails(id) {
        return http.get(`/api/classes/${id}`);
    },

    // 学生分班
    addStudentToClass(classId, studentId) {
        return http.post(`/api/classes/${classId}/students/${studentId}`);
    },

    removeStudentFromClass(classId, studentId) {
        return http.delete(`/api/classes/${classId}/students/${studentId}`);
    }
};
