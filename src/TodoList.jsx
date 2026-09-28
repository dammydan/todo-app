import { useEffect, useState } from "react";
import { api } from "./api.js";

export default function TodoList({ onLogout }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    api("/todos")
      .then(setTodos)
      .catch(() => setError("Can't reach the server. Is the backend running?"));
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const created = await api("/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTodos([...todos, created]);
      setTitle("");
      setError("");
    } catch {
      setError("Couldn't add that item. Try again.");
    }
  }

  async function toggle(todo) {
    const updated = await api(`/todos/${todo.id}`, {
      method: "PATCH",
      body: JSON.stringify({ done: !todo.done }),
    });
    setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
  }

  async function remove(id) {
    await api(`/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  }

  function saveOrder(list) {
    api("/todos/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids: list.map((t) => t.id) }),
    }).catch(() => setError("Couldn't save the new order."));
  }

  function moveByButton(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= todos.length) return;
    const next = [...todos];
    [next[index], next[target]] = [next[target], next[index]];
    setTodos(next);
    saveOrder(next);
  }

  function onDragOver(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...todos];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setTodos(next);
    setDragIndex(index);
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="page">
      <div className="top-row">
        <h1>Today</h1>
        <button className="link-button" onClick={onLogout}>Log out</button>
      </div>
      <p className="count">
        {todos.length === 0 ? "Nothing yet." : `${remaining} of ${todos.length} left to do`}
      </p>

      <form className="add" onSubmit={addTodo}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New item"
          maxLength={200}
        />
        <button type="submit">Add item</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      {todos.length === 0 && !error && (
        <p className="empty">Type an item above and press Add item to start your list.</p>
      )}

      <ul className="list">
        {todos.map((todo, i) => (
          <li
            key={todo.id}
            className={`item ${todo.done ? "done" : ""} ${dragIndex === i ? "dragging" : ""}`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDragEnd={() => { setDragIndex(null); saveOrder(todos); }}
          >
            <span className="grip" aria-hidden="true" title="Drag to reorder">⋮⋮</span>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggle(todo)} />
              <span>{todo.title}</span>
            </label>
            <span className="actions">
              <button onClick={() => moveByButton(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button onClick={() => moveByButton(i, 1)} disabled={i === todos.length - 1} aria-label="Move down">↓</button>
              <button className="delete" onClick={() => remove(todo.id)} aria-label={`Delete ${todo.title}`}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
