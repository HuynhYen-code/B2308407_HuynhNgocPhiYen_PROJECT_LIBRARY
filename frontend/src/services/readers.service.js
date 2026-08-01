import api from './api'

export const readerService = {
  // Reader self
  getMyProfile: () => api.get('/readers/profile/me'),
  selfRegister: (data) => api.post('/readers/profile/me', data),
  updateMyProfile: (data) => api.put('/readers/profile/me', data),

  // Staff/Admin
  getAll: (params) => api.get('/readers', { params }),
  getById: (id) => api.get(`/readers/${id}`),
  create: (data) => api.post('/readers', data),
  update: (id, data) => api.put(`/readers/${id}`, data),
  verify: (id) => api.patch(`/readers/${id}/verify`),
  // lock: khoa=true → BiKhoa, khoa=false → DaXacMinh
  lock: (id, khoa = true, lyDo = '') => api.patch(`/readers/${id}/lock`, { khoa, lyDo }),
  remove: (id) => api.delete(`/readers/${id}`)
}
