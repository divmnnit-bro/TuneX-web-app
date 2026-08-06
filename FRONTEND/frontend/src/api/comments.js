import api from './axios'

export const getAllComments = (videoId) => api.get(`/comments/get-all-comments/${videoId}`)
export const addComment = (videoId, content) => api.post(`/comments/add-comment/${videoId}`, { content })
export const editComment = (commentId, content) => api.patch(`/comments/edit-comment/${commentId}`, { content })
export const deleteComment = (commentId) => api.delete(`/comments/delete-comment/${commentId}`)
export const toggleCommentLike = (commentId) => api.patch(`/comments/toggle-comment-like/${commentId}`)