import client from "./client";

export const listCards = (params) =>
  client.get("/cards/", { params }).then((r) => r.data);

export const getCard = (id) =>
  client.get(`/cards/${id}/`).then((r) => r.data);

export const createCard = (payload) =>
  client.post("/cards/", payload).then((r) => r.data);

export const updateCard = (id, payload) =>
  client.patch(`/cards/${id}/`, payload).then((r) => r.data);

export const deleteCard = (id) =>
  client.delete(`/cards/${id}/`);

export const reviewCard = (id, correct) =>
  client.post(`/cards/${id}/review/`, { correct }).then((r) => r.data);
