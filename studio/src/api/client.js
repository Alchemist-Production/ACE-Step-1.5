import axios from 'axios';

const client = axios.create({
  baseURL: '/',
  timeout: 60000, // 60s timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

export const api = {
  getModels: () => client.get('/v1/models'),
  getHistory: () => client.get('/v1/history'),
  deleteHistory: (id) => client.delete('/v1/history', { data: { id } }),
  generateMusic: (params) => client.post('/release_task', params),
  queryResult: (taskIds) => client.post('/query_result', { task_id_list: JSON.stringify(taskIds) }),
  getRandomSample: (mode = 'simple_mode') => client.post('/create_random_sample', { sample_type: mode }),
  formatInput: (prompt, lyrics) => client.post('/format_input', { prompt, lyrics }),
  getLoras: () => client.get('/v1/loras'),
  getGuide: () => client.get('/v1/guide'),
  updateLibrary: (data) => client.post('/v1/library/update', data),
  loadLora: (path) => client.post('/v1/loras/load', { path }),
  unloadLora: () => client.post('/v1/loras/unload'),
  setLoraScale: (scale) => client.post('/v1/loras/scale', { scale }),
};

export default client;
