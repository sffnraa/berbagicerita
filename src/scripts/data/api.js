import { BASE_URL } from '../config';
import { getAccessToken } from '../utils/auth';

const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  GET_ALL_STORIES: `${ BASE_URL}/stories`,
  GET_DETAIL_STORIES: (id) => `${ BASE_URL}/stories/${id}`,
  ADD_NEW_STORIES: `${ BASE_URL}/stories`,
  SUBSCRIBE: `${ BASE_URL }/notifications/subscribe`,
  UNSUBSCRIBE: `${ BASE_URL }/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const resp = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ name, email, password}),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message);
  return json;
}

export async function getLogin({ email, password }) {
  const resp = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password}),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message);
  return json;
}

export async function getAllStories(accessToken) {
  const resp = await fetch(ENDPOINTS.GET_ALL_STORIES, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message);
  return json.listStory;
}

export async function getDetailStory(id) {
  const accessToken = getAccessToken();
  const resp = await fetch(ENDPOINTS.GET_DETAIL_STORIES(id), {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}`},
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message);
  return json.story;
}

export async function addNewStory(accessToken, {  
  description, 
  photoFile, 
  lat = null, 
  lon = null,
}) {
  // Validasi file
  if (!photoFile) throw new Error('Foto wajib diunggah!');
  if (!photoFile.type.startsWith('image/')) throw new Error('File harus berupa gambar!');
  if (photoFile.size > 1024 * 1024) throw new Error('Ukuran file maksimal 1MB!');

  // Buat FormData
  const formData = new FormData();

  formData.append('description', description);
  formData.append('photo', photoFile);
  if (lat !== null) formData.append('lat', lat);
  if (lon !== null) formData.append('lon', lon);

  const resp = await fetch(ENDPOINTS.ADD_NEW_STORIES, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message);
  return json;
}

export async function getSubscribe({endpoint, keys: {p256dh, auth} }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth},
  });
  const resp = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`,
               'Content-Type': 'application/json'
    },
    body: data,
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message);
  return json;
}

export async function getUnSubscribe(subscription) {
  const accessToken = getAccessToken();
  const data = { endpoint: subscription.endpoint};
  const resp = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}`,
               'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message);
  return json;
}