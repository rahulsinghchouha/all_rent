export async function refreshAccessToken() {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to refresh access token");
  }

  const data = await response.json();
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken as string;
  }

  throw new Error("No access token returned from refresh");
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = new Headers(init.headers ?? {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "same-origin",
  });

  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${newToken}`);

      return fetch(input, {
        ...init,
        headers,
        credentials: init.credentials ?? "same-origin",
      });
    } catch (error) {
      return response;
    }
  }

  return response;
}
