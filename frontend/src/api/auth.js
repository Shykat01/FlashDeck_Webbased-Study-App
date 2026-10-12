import client from "./client";

export const login = (credentials) =>
  client.post("/login/", credentials).then((r) => r.data);

export const register = (payload) =>
  client.post("/register/", payload).then((r) => r.data);

export const refreshToken = (refresh) =>
  client.post("/token/refresh/", { refresh }).then((r) => r.data);
