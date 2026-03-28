import axios from "axios";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  if (authToken) {
    req.headers.Authorization = `Bearer ${authToken}`;
  }
  return req;
});

export default API;