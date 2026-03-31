import { client } from './client';
 
export const orderApi = {
  sync: (sessionId, orders) => client.post('/pos/sync', { sessionId, orders }),
};
 