const API_BASE = "http://127.0.0.1:8000/api";

export const fetchWithAuth = async (url: string, options: any = {}) => {
  let access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  const isFormData = options.body instanceof FormData;

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(isFormData ? {} : { "Content-Type": "application/json" }), // ✅ only set for JSON
      Authorization: access ? `Bearer ${access}` : "",
    },
  });

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
      localStorage.setItem("access", access);
      response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });
    } else{
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
};