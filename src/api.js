async function request(apiUrl, path = "", options = {}) {
  if (!apiUrl) {
    throw new Error("VITE_API_URL 환경변수가 설정되지 않았습니다.");
  }

  let response;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("서버에 연결하지 못했습니다.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "요청을 처리하지 못했습니다.");
  }

  return data;
}

export function fetchTodos(apiUrl) {
  return request(apiUrl);
}

export function createTodo(apiUrl, content) {
  return request(apiUrl, "", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function updateTodo(apiUrl, id, content) {
  return request(apiUrl, `/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export function deleteTodo(apiUrl, id) {
  return request(apiUrl, `/${id}`, {
    method: "DELETE",
  });
}
