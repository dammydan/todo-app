import { useState } from "react";
import Auth from "./Auth.jsx";
import TodoList from "./TodoList.jsx";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("token"));

  function logout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
  }

  return loggedIn ? (
    <TodoList onLogout={logout} />
  ) : (
    <Auth onLoggedIn={() => setLoggedIn(true)} />
  );
}
