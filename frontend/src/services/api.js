import axios from "axios";

const API = axios.create({
  baseURL: "https://nexabusiness-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;