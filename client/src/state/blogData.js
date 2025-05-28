export const initialData = {
  currentUser: null,
  users: [
    {
      id: 1,
      username: "alice",
      password: "alicepass",
      email: "alice@example.com",
      isAdmin: true
    },
    {
      id: 2,
      username: "bob",
      password: "bobpass",
      email: "bob@example.com",
      isAdmin: false
    }
  ],
  posts: [
    {
      id: 1,
      authorId: 1,
      title: "Welcome to IntraTech Blog",
      content: "This is the inaugural post for the IntraTech internal blog.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [2], // user ids
      comments: [1]
    }
  ],
  comments: [
    {
      id: 1,
      postId: 1,
      authorId: 2,
      content: "Congrats, looking forward to more posts!",
      createdAt: new Date().toISOString()
    }
  ]
};

// Reducer to simulate backend logic in-memory
export function dataReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUser: action.user };
    case "LOGOUT":
      return { ...state, currentUser: null };
    case "REGISTER":
      return {
        ...state,
        users: [...state.users, { ...action.user, id: state.users.length + 1 }]
      };
    // Post CRUD
    case "ADD_POST":
      return {
        ...state,
        posts: [
          ...state.posts,
          {
            ...action.post,
            id: state.posts.length + 1,
            likes: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    case "EDIT_POST":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.post.id
            ? { ...post, ...action.post, updatedAt: new Date().toISOString() }
            : post
        )
      };
    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.postId)
      };
    // Comments
    case "ADD_COMMENT":
      const newComment = {
        id: state.comments.length + 1,
        ...action.comment,
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        comments: [...state.comments, newComment],
        posts: state.posts.map((post) =>
          post.id === action.comment.postId
            ? { ...post, comments: [...post.comments, newComment.id] }
            : post
        )
      };
    // Likes
    case "TOGGLE_LIKE":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.postId
            ? {
                ...post,
                likes: post.likes.includes(action.userId)
                  ? post.likes.filter((uid) => uid !== action.userId)
                  : [...post.likes, action.userId]
              }
            : post
        )
      };
    default:
      return state;
  }
}
