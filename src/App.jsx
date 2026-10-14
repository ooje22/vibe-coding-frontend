import { useEffect, useState } from "react";
import { createTodo, deleteTodo, fetchTodos, updateTodo } from "./api";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchTodos(API_URL)
      .then((data) => {
        if (!ignore) setTodos(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    const next = content.trim();

    if (!next) {
      setError("할 일 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const todo = await createTodo(API_URL, next);
      setTodos((current) => [todo, ...current]);
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(todo) {
    setEditingId(todo._id);
    setEditContent(todo.content);
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function handleEdit(event) {
    event.preventDefault();
    const next = editContent.trim();

    if (!next) {
      setError("할 일 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const updated = await updateTodo(API_URL, editingId, next);
      setTodos((current) =>
        current.map((todo) => (todo._id === updated._id ? updated : todo)),
      );
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    setBusy(true);
    setError("");

    try {
      await deleteTodo(API_URL, id);
      setTodos((current) => current.filter((todo) => todo._id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <p className="eyebrow">Todo</p>
        <h1>할 일</h1>
        <p className="summary">
          {loading ? "목록을 불러오는 중입니다." : `${todos.length}개`}
        </p>
      </header>

      <form className="composer" onSubmit={handleAdd}>
        <label className="sr-only" htmlFor="new-todo">
          새 할 일
        </label>
        <input
          id="new-todo"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="할 일을 입력해 주세요"
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          추가
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="status">불러오는 중…</p>
      ) : todos.length === 0 ? (
        <p className="status">아직 할 일이 없습니다.</p>
      ) : (
        <ul className="list">
          {todos.map((todo) => (
            <li key={todo._id} className="item">
              {editingId === todo._id ? (
                <form className="editor" onSubmit={handleEdit}>
                  <label className="sr-only" htmlFor={`edit-${todo._id}`}>
                    할 일 수정
                  </label>
                  <input
                    id={`edit-${todo._id}`}
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    disabled={busy}
                    autoFocus
                  />
                  <div className="actions">
                    <button type="submit" disabled={busy}>
                      저장
                    </button>
                    <button type="button" onClick={cancelEdit} disabled={busy}>
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="content">{todo.content}</p>
                  <div className="actions">
                    <button type="button" onClick={() => startEdit(todo)} disabled={busy}>
                      수정
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(todo._id)}
                      disabled={busy}
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
