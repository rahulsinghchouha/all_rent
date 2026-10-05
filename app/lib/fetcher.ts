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

  return response;
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const requestInit: RequestInit = {
    ...init,
    credentials: init.credentials ?? "include",
    headers: new Headers(init.headers ?? {}),
  };

  const response = await fetch(input, requestInit);

  if (response.status !== 401) {
    return response;
  }

  try {
    await refreshAccessToken();
    return fetch(input, {
      ...requestInit,
      headers: new Headers(requestInit.headers ?? {}),
    });
  } catch {
    return response;
  }
}
