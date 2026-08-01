import api from './api'

export const publisherService = {
  getAll: (params) => api.get('/publishers', { params }),
  getById: (id) => api.get(`/publishers/${id}`),
  create: (data) => api.post('/publishers', data),
  update: (id, data) => api.put(`/publishers/${id}`, data),
  remove: (id) => api.delete(`/publishers/${id}`)
}
