import api from "./axios";

export const fetchComments = async (publicationId) => {
  const { data } = await api.get(`/publications/${publicationId}/comments`);
  return data;
};

export const createComment = async (publicationId, payload) => {
  const { data } = await api.post(
    `/publications/${publicationId}/comments`,
    payload
  );
  return data;
};

export const deleteComment = async (publicationId, commentId) => {
  const { data } = await api.delete(
    `/publications/${publicationId}/comments/${commentId}`
  );
  return data;
};

export default {
  fetchComments,
  createComment,
  deleteComment,
};
