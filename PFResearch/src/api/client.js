const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/pos/api';
 
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
 
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
 
  if (data.status === 'error') {
    throw new Error(data.message || 'API error');
  }
  return data;
}
 
export const client = {
  get:  (path)        => request('GET',  path),
  post: (path, body)  => request('POST', path, body),
};
 