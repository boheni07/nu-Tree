import axios from 'axios';

// 백엔드 URL이 고정되어 있지 않으므로 추후 환경변수 처리 필요
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const fetchTrees = async () => {
  const response = await axios.get(`${API_URL}/trees/`);
  return response.data;
};

export const fetchTreeDetail = async (id) => {
  const response = await axios.get(`${API_URL}/trees/${id}`);
  return response.data;
};
