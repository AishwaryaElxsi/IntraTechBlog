import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Stack,
  Snackbar,
  Alert,
  Fade
} from "@mui/material";
import { ThumbUp, ThumbUpOutlined, Bookmark, BookmarkBorder, Share } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import Showdown from "showdown";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

// Styling
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(118deg,#edeff8 0,#e8f2fa 100%)",
  padding: theme.spacing(5, 2),
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start"
}));
const PostPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 840,
  width: "100%",
  borderRadius: 18,
  padding: theme.spacing(5, 4),
  boxShadow: "0 14px 40px 0 rgba(37,63,150,0.12)",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1)
}));
const CoverImage = styled("img")(({ theme }) => ({
  width: "100%",
  borderRadius: 20,
  objectFit: "cover",
  maxHeight: 340,
  marginBottom: theme.spacing(2),
  background: "#e8eef9"
}));

const MarkdownBox = styled(Box)(({ theme }) => ({
  fontSize: 18,
  color: "#293458",
  lineHeight: 1.68,
  marginBottom: theme.spacing(3),
  overflowWrap: "break-word",
  "& h1, & h2, & h3, & h4": {
    fontWeight: 800,
    color: "#2A43BF",
    marginTop: 22
  },
  "& a": { color: "#2064cc", textDecoration: "underline" },
  "& pre, & code": { background: "#edeef2", borderRadius: 4, fontSize: 15 }
}));

const TagChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  fontWeight: 500,
  fontSize: 14,
  background: "#e3e8fa",
  color: "#3d38bb",
  borderRadius: 7
}));

const AuthorBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  margin: theme.spacing(1, 0)
}));

const EngagementRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2)
}));

const CommentFormBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(3, 0, 1, 0),
  background: "#f8fafb",
  borderRadius: 14,
  padding: theme.spacing(2.2, 2, 2, 2),
  border: "1.5px solid #e0e9fa"
}));

// PUBLIC_INTERFACE
function PostDetails() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [engaged, setEngaged] = useState({ likes: 0, liked: false, bookmarks: 0, bookmarked: false });
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const [commentPosting, setCommentPosting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Markdown
  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    openLinksInNewWindow: true,
    emoji: true
  });

  // Fetch post details
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/posts/${id}`, { withCredentials: true })
      .then(res => {
        setPost(res.data);
        setEngaged({
          likes: (res.data.likes || []).length,
          liked: !!user && (res.data.likes || []).includes(user.id),
          bookmarks: (res.data.reactions || []).filter(r => r.type === "bookmark").length,
          bookmarked: !!user && (res.data.reactions || []).find(r => r.user === user.id || (r.user && r.user._id === user.id))
        });
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        navigate("/feed");
      });
    // eslint-disable-next-line
  }, [id, user]);

  // Fetch comments
  const fetchComments = () => {
    setCommentsLoading(true);
    axios
      .get(`/api/comments?post=${id}`, { withCredentials: true })
      .then(res => {
        setComments(res.data.comments || []);
        setCommentsLoading(false);
      })
      .catch(() => setCommentsLoading(false));
  };
  useEffect(() => { fetchComments(); }, [id]);

  // Clap Handler
  const handleClap = async () => {
    if (!user) return navigate("/login");
    try {
      const res = await axios.post(`/api/posts/${id}/clap`, {}, { withCredentials: true });
      setEngaged(e => ({ ...e, likes: res.data.likes, liked: res.data.liked }));
    } catch {}
  };

  // Bookmark Handler
  const handleBookmark = async () => {
    if (!user) return navigate("/login");
    try {
      const res = await axios.post(`/api/posts/${id}/bookmark`, {}, { withCredentials: true });
      setEngaged(e => ({ ...e, bookmarks: res.data.bookmarks, bookmarked: res.data.bookmarked }));
    } catch {}
  };

  // Share Handler
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowAlert("Link copied to clipboard!");
    } catch {
      setShowAlert("Failed to copy link.");
    }
  };

  // Post Comment Handler
  const handleCommentPost = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!commentValue.trim()) {
      setCommentError("Comment must not be empty.");
      setShowAlert(true);
      return;
    }
    setCommentPosting(true);
    setCommentError("");
    try {
      await axios.post("/api/comments", { post: id, body: commentValue.trim() }, { withCredentials: true });
      setCommentValue("");
      fetchComments();
      setShowAlert("Comment posted!");
    } catch (err) {
      setCommentError("Failed to post comment.");
      setShowAlert(true);
    }
    setCommentPosting(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <PostPaper>
          <Box sx={{ my: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CircularProgress size={56} color="primary" />
            <Typography sx={{ mt: 3 }} color="text.secondary">Loading post...</Typography>
          </Box>
        </PostPaper>
      </PageContainer>
    );
  }
  if (!post) return null;

  return (
    <PageContainer>
      <Fade in>
        <PostPaper elevation={5}>
          {post.featuredImage && <CoverImage src={post.featuredImage} alt="cover" />}
          <Typography variant="h3" fontWeight={900} gutterBottom sx={{ letterSpacing: 0.2, mb: 1.5 }}>
            {post.title}
          </Typography>
          <AuthorBox>
            <Avatar src={post.author?.avatar || ""} sx={{ width: 40, height: 40, mr: 1 }} />
            <Box sx={{ mr: 2 }}>
              <Typography fontWeight={700} fontSize={17} sx={{ color: "#293458" }}>{post.author?.name}</Typography>
              <Typography color="text.secondary" fontSize={14}>
                {new Date(post.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </Typography>
            </Box>
          </AuthorBox>
          <Box sx={{ mb: 2 }}>
            {post.tags && post.tags.map(tag =>
              <TagChip label={tag} key={tag} />
            )}
          </Box>
          <MarkdownBox dangerouslySetInnerHTML={{ __html: converter.makeHtml(post.body || "") }} />
          <Divider sx={{ my: 3 }} />
          <EngagementRow>
            <IconButton color={engaged.liked ? "primary" : "default"} onClick={handleClap} size="large">
              {engaged.liked ? <ThumbUp /> : <ThumbUpOutlined />}
            </IconButton>
            <Typography sx={{ minWidth: 24, mr: 2 }}>{engaged.likes}</Typography>
            <IconButton color={engaged.bookmarked ? "secondary" : "default"} onClick={handleBookmark} size="large">
              {engaged.bookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
            <Typography sx={{ minWidth: 24, mr: 2 }}>{engaged.bookmarks}</Typography>
            <IconButton onClick={handleShare} size="large">
              <Share />
            </IconButton>
            <Typography sx={{ ml: 1, color: "#aaa" }}>Share</Typography>
          </EngagementRow>
          <Divider sx={{ my: 3 }} />

          {/* Comments */}
          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: "#2A43BF" }}>
            Comments
          </Typography>
          <CommentFormBox>
            {user ? (
              <form onSubmit={handleCommentPost}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Avatar src={user.avatar || ""} sx={{ mt: 1 }} />
                  <TextField
                    label="Write a comment…"
                    value={commentValue}
                    onChange={e => setCommentValue(e.target.value)}
                    fullWidth
                    minRows={2}
                    multiline
                    variant="outlined"
                    disabled={commentPosting}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={commentPosting || !commentValue.trim()}
                    sx={{ height: 50, fontWeight: 700, borderRadius: 2, px: 3, mt: 1 }}
                  >
                    {commentPosting ? "Posting…" : "Comment"}
                  </Button>
                </Stack>
              </form>
            ) : (
              <Button variant="outlined" color="primary" onClick={() => navigate("/login")}>
                Login to comment
              </Button>
            )}
            {commentError && (
              <Alert severity="error" sx={{ mt: 2 }}>{commentError}</Alert>
            )}
          </CommentFormBox>
          {/* Comments List */}
          <Box sx={{ mt: 1 }}>
            {commentsLoading ? (
              <Box sx={{ py: 5, textAlign: "center" }}><CircularProgress /></Box>
            ) : comments.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                No comments yet.
              </Typography>
            ) : (
              comments.map(c => (
                <Box key={c.id} sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
                  <Avatar src={c.author?.avatar || ""} sx={{ mr: 2 }} />
                  <Box>
                    <Typography fontSize={16} sx={{ fontWeight: 700 }}>{c.author?.name}</Typography>
                    <Typography color="text.secondary" fontSize={14}>{new Date(c.createdAt).toLocaleString()}</Typography>
                    <Typography sx={{ mt: .5 }}>{c.body}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Alerts */}
          <Snackbar open={!!showAlert} autoHideDuration={2100} onClose={() => setShowAlert(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert severity={commentError ? "error" : "success"}>{showAlert || commentError}</Alert>
          </Snackbar>
        </PostPaper>
      </Fade>
    </PageContainer>
  );
}

export default PostDetails;
