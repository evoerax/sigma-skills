const API_BASE = '/api';

export async function fetchTools() {
  const res = await fetch(`${API_BASE}/tools`);
  return res.json();
}

export async function fetchSkills(tool?: string) {
  const url = tool ? `${API_BASE}/skills?tool=${tool}` : `${API_BASE}/skills`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchSkillContent(id: string) {
  const res = await fetch(`${API_BASE}/skills/${id}/content`);
  return res.json();
}

export async function deleteSkill(id: string) {
  const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchFolders() {
  const res = await fetch(`${API_BASE}/folders`);
  return res.json();
}

export async function addFolder(path: string) {
  const res = await fetch(`${API_BASE}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  return res.json();
}

export async function removeFolder(path: string) {
  const res = await fetch(`${API_BASE}/folders/${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
  return res.json();
}
