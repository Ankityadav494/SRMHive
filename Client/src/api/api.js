import axios from "axios";

let authToken = sessionStorage.getItem('token') || null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((req) => {
  if (authToken) {
    req.headers.Authorization = `Bearer ${authToken}`;
  }
  return req;
});

export default API;