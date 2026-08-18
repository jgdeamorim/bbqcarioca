export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // In a real environment, Cloudflare Access handles the JWT via cookies on the same domain
  // or we pass a specific token if it's cross-origin.
  // For development, we might mock it or expect the proxy to handle it.
  
  const token = localStorage.getItem('cf_access_token') || 'dev_token';
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.bbqcarioca.work';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized: redirect to Cloudflare Access login
    window.location.href = '/cdn-cgi/access/login';
    throw new Error('Unauthorized');
  }

  return response;
}
