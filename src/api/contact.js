import axiosInstance from './axios.js';

export const sendContact = async (data) => {
const response = await axiosInstance.post('/contact', data);
  return response.data;
};
