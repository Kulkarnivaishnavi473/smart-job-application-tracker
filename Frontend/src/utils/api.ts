const API_BASE = import.meta.env.VITE_API_BASE; // ✅ use env variable

export const fetchWithAuth = async (url: string, options: any = {}) => {
  let access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  const isFormData = options.body instanceof FormData;

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(access && { Authorization: `Bearer ${access}` }), // ✅ better handling
    },
  });

  // 🔁 Handle token refresh
  if (response.status === 401 && refresh) {
    const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();

      access = data.access;

      // ✅ FIXED: correct key name
      localStorage.setItem("access_token", access);

      // 🔁 retry original request
      response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${access}`,
        },
      });
    } else {
      // ❌ refresh failed → logout
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
};