import axios from 'axios';

const apiClient = axios.create({
  // baseURL: "/api",
  baseURL: "https://gatepass-backend-fiod.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});



export default apiClient;