import React from "react";
import { render, act } from "@testing-library/react";
import { BlogProvider, useBlogContext } from "../state/BlogContext";
import { initialData } from "../state/blogData";

// Simple component to read and dispatch BlogContext
function BlogContextTestComponent({ onRender, onDispatch }) {
  const { state, dispatch, login, logout, register } = useBlogContext();
  onRender && onRender({ state });
  return (
    <div>
      <button onClick={() => login("alice", "alicepass")}>Login Alice</button>
      <button onClick={() => login("bob", "wrong")}>Login Wrong</button>
      <button onClick={logout}>Logout</button>
      <button
        onClick={() =>
          register({ username: "eva", password: "evapass", email: "eva@x.com", isAdmin: false })
        }
      >
        Register Eva
      </button>
      <button
        onClick={() =>
          dispatch({
            type: "ADD_POST",
            post: { authorId: 1, title: "New Test Post", content: "Test Content" }
          })
        }
      >
        Add Post
      </button>
    </div>
  );
}

describe("BlogContext and reducer", () => {
  it("should handle login (success and failure)", () => {
    let contextResult;
    const { getByText } = render(
      <BlogProvider>
        <BlogContextTestComponent onRender={({ state }) => (contextResult = state)} />
      </BlogProvider>
    );

    // Start not logged in
    expect(contextResult.currentUser).toBeNull();

    // Successful login
    act(() => {
      getByText("Login Alice").click();
    });
    expect(contextResult.currentUser).not.toBeNull();
    expect(contextResult.currentUser.username).toBe("alice");

    // Logout
    act(() => {
      getByText("Logout").click();
    });
    expect(contextResult.currentUser).toBeNull();

    // Failed login attempt (bad password)
    act(() => {
      getByText("Login Wrong").click();
    });
    expect(contextResult.currentUser).toBeNull();
  });

  it("should handle registration (unique username only)", () => {
    let contextResult;
    const { getByText } = render(
      <BlogProvider>
        <BlogContextTestComponent onRender={({ state }) => (contextResult = state)} />
      </BlogProvider>
    );
    // Eva is registered
    act(() => {
      getByText("Register Eva").click();
    });
    expect(contextResult.users.some((u) => u.username === "eva")).toBe(true);
    // Trying to register again should not add another Eva
    act(() => {
      getByText("Register Eva").click();
    });
    const count = contextResult.users.filter((u) => u.username === "eva").length;
    expect(count).toBe(1);
  });

  it("should update state when a post is added", () => {
    let contextResult;
    const { getByText } = render(
      <BlogProvider>
        <BlogContextTestComponent onRender={({ state }) => (contextResult = state)} />
      </BlogProvider>
    );
    // Add a post
    act(() => {
      getByText("Add Post").click();
    });
    expect(contextResult.posts.some((p) => p.title === "New Test Post")).toBe(true);
  });
});
