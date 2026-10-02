import API from "./api";

export async function loginUser(email, password) {
  const response = await API.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function registerUser(name, email, password) {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
}

export async function getCurrentUser(token) {
  const response = await API.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
