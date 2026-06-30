import axios from 'axios';

const api = axios.create({
  // baseURL: "/api",
  baseURL: "https://gatepass-backend-fiod.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});



export default api;