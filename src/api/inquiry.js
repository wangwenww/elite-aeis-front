import http from './http';
import { INQUIRY_API } from '../API_Interfaces';

export const inquiryApi = {
    // Submit inquiry
    submitInquiry(data) {
        return http.post(INQUIRY_API.SUBMIT_INQUIRY, data);
    },
};