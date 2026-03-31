import { client } from './client';
 
export const sessionApi = {
  getStatus:   (sessionId) => client.get(`/session/status?sessionId=${sessionId}`),
  openSession: (sessionId) => client.post('/session/open',  { sessionId }),
  closeSession:(sessionId, closingNotes) =>
    client.post('/session/close', { sessionId, closingNotes }),
};