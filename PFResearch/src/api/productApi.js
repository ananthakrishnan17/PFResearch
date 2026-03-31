import { client } from './client';
 
export const productApi = {
  getAll: (configId) => client.get(`/products?configId=${configId}`),
};