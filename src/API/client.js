import axios from "axios";
const api = axios.create({
  baseURL: "http://160.60.60.32:8000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});
export async function apiGet(path) {
  const response = await api.get(path);
  return response.data;
}

export async function apiPost(path, body) {
  const response = await api.post(path, body);
  return response.data;
}

export async function apiDelete(path) {
  const response = await api.delete(path);
  return response.data;
}

export async function apiPatch(path, body) {
  const response = await api.patch(path, body);
  return response.data;
}