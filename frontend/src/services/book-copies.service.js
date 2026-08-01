import api from './api'

export const bookCopyService = {
  getAll: (params) => api.get('/book-copies', { params }),
  getById: (id) => api.get(`/book-copies/${id}`),
  create: (data) => api.post('/book-copies', data),
  update: (id, data) => api.put(`/book-copies/${id}`, data),
  remove: (id) => api.delete(`/book-copies/${id}`)
}
