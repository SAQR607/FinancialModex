import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, full_name) => api.post('/auth/register', { email, password, full_name }),
  getCurrentUser: () => api.get('/auth/me')
};

export const competitionService = {
  getAll: () => api.get('/competitions'),
  getById: (id) => api.get(`/competitions/${id}`),
  getActive: () => api.get('/competitions/active'),
  create: (data) => api.post('/competitions', data),
  update: (id, data) => api.put(`/competitions/${id}`, data),
  delete: (id) => api.delete(`/competitions/${id}`)
};

export const adminService = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  approveUser: (userId) => api.put(`/admin/users/${userId}/approve`),
  rejectUser: (userId) => api.put(`/admin/users/${userId}/reject`),
  createQuestion: (competitionId, data) => api.post(`/admin/competitions/${competitionId}/questions`, data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  assignJudge: (data) => api.post('/admin/judges/assign', data),
  getAllTeams: (params) => api.get('/admin/teams', { params }),
  broadcastMessage: (messageText) => api.post('/admin/broadcast', { message_text: messageText })
};

export const teamService = {
  create: (data) => api.post('/teams/create', data),
  join: (inviteCode) => api.post('/teams/join', { invite_code: inviteCode }),
  getMyTeam: () => api.get('/teams/my-team'),
  leave: (teamId) => api.delete(`/teams/${teamId}/leave`)
};

export const qualificationService = {
  getQuestions: (competitionId) => api.get(`/qualification/competitions/${competitionId}/questions`),
  submitAnswers: (competitionId, answers) => api.post(`/qualification/competitions/${competitionId}/answers`, { answers }),
  getMyAnswers: (competitionId) => api.get(`/qualification/competitions/${competitionId}/my-answers`)
};

export const judgeService = {
  getAssignedTeams: (competitionId) => api.get(`/judge/competitions/${competitionId}/teams`),
  submitScore: (data) => api.post('/judge/scores', data),
  getScores: (params) => api.get('/judge/scores', { params })
};

export const fileService = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTeamFiles: (teamId) => api.get(`/files/team/${teamId}`),
  delete: (id) => api.delete(`/files/${id}`)
};

export const messageService = {
  getGlobalMessages: () => api.get('/messages/global'),
  getRoomMessages: (roomId) => api.get(`/messages/room/${roomId}`),
  createMessage: (data) => api.post('/messages', data)
};

export default api;

