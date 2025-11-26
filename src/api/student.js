import http from './http';

export const studentApi = {
    // 获取学生列表
    getStudents() {
        return http.get('/api/students');
    },

    // 创建学生
    createStudent(data) {
        return http.post('/api/students', data);
    }
};
