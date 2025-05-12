const response = await axios.get(`${API_BASE_URL}/api/programs`);
console.log('Răspuns de la server:', response.data);
console.log('Tipul răspunsului:', typeof response.data, Array.isArray(response.data));

if (Array.isArray(response.data)) {
  setPrograms(response.data);
  console.log('Setat programs cu array:', response.data);
} else if (response.data && response.data.data) {
  setPrograms(response.data.data);
  console.log('Setat programs cu data.data:', response.data.data);
} else {
  console.error('Format invalid al răspunsului:', response.data);
  setError('Format invalid al datelor');
} 