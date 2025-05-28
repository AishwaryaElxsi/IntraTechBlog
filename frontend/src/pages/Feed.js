import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Button,
  Paper,
  Fade
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Styled components for a clean, modern, Medium-like UI
const FeedContainer = styled(Box)(({ theme }) => ({
  background: "linear-gradient(160deg,#f8fafd 0%,#f2f6fb 100%)",
  minHeight: "100vh",
  padding: theme.spacing(4, 0),
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
}));

const FeedPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 830,
  background: "#fff",
  borderRadius: 18,
  padding: theme.spacing(5, 3),
  marginBottom: theme.spacing(4),
  boxShadow: "0 8px 28px 0 rgba(30,45,80,0.13)",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch"
}));

const ArticleCard = styled(Card)(({ theme }) => ({
  display: "flex",
  borderRadius: 18,
  marginBottom: theme.spacing(3),
  boxShadow: "0 4px 16px 0 rgba(30,45,80,0.09)",
  background: "#fcfcfc",
  transition: "box-shadow .23s cubic-bezier(.4,0,.2,1),transform .15s cubic-bezier(.4,0,.2,1)",
  "&:hover": {
    boxShadow: "0 16px 40px 0 rgba(30,45,80,0.15)",
    transform: "translateY(-2px) scale(1.01)"
  }
}));

// Show image (if any), else beautiful fallback
const CardImage = styled(CardMedia)(({ theme }) => ({
  minWidth: 120,
  width: 120,
  height: 120,
  borderRadius: 14,
  margin: theme.spacing(2),
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#eaeef3"
}));

const ArticleBody = styled(CardContent)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 0,
  paddingBottom: '12px !important'
}));

const TagChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  fontWeight: 500,
  fontSize: 14,
  background: "#ecedf6",
  color: "#425adb",
  borderRadius: 8,
  letterSpacing: 0.2,
  "&.MuiChip-clickable": { background: "#e3eafa" }
}));

const AuthorBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(2)
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  marginBottom: theme.spacing(3),
  flexWrap: "wrap"
}));

function formatRelativeDate(dateStr) {
  // Relative time (e.g. "3 hours ago")
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 1000 / 60);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  // fallback
  return d.toLocaleDateString();
}

// PUBLIC_INTERFACE
function Feed() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [error, setError] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // PUBLIC_INTERFACE
  const fetchFeed = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = [];
      if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
      if (params.tag) query.push(`tag=${encodeURIComponent(params.tag)}`);
      const url = "/api/posts" + (query.length ? `?${query.join("&")}` : "");
      const res = await axios.get(url, { withCredentials: true });
      setPosts(res.data.posts || []);
    } catch (err) {
      setError("Failed to fetch articles.");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const res = await axios.get("/api/posts/tags", { withCredentials: true });
      setAllTags(res.data.tags || []);
    } catch (e) {
      setAllTags([]);
    }
    setTagsLoading(false);
  };

  // PUBLIC_INTERFACE
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    fetchFeed();
    fetchTags();
    // eslint-disable-next-line
  }, [user]);

  // PUBLIC_INTERFACE
  const onSearch = () => {
    fetchFeed({ search, tag: tagFilter });
  };

  // PUBLIC_INTERFACE
  const onTagClick = (t) => {
    setTagFilter(t);
    fetchFeed({ search, tag: t });
  };

  // PUBLIC_INTERFACE
  const clearFilters = () => {
    setSearch("");
    setTagFilter("");
    fetchFeed();
  };

  // Extra: If not authenticated, show nothing to prevent UI blink
  if (!user) {
    return (
      <FeedContainer>
        <FeedPaper elevation={3}>
          <Box sx={{ textAlign: "center", my: 12 }}>
            <CircularProgress size={44} />
          </Box>
        </FeedPaper>
      </FeedContainer>
    );
  }

  return (
    <FeedContainer>
      <Fade in>
        <FeedPaper elevation={3}>
          <FilterBar>
            <Box sx={{ flex: 1 }}>
              <TextField
                variant="outlined"
                placeholder="Search tech blogs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{ width: 220, mr: 1, background: "#f5f8fc", borderRadius: 2 }}
                onKeyDown={e => e.key === "Enter" && onSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 2, textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                onClick={onSearch}
              >
                Search
              </Button>
              {tagFilter && (
                <Chip
                  label={`Tag: ${tagFilter}`}
                  onDelete={clearFilters}
                  sx={{ ml: 1, background: "#F5B544", fontWeight: 600, color: "#fff", borderRadius: 2 }}
                />
              )}
            </Box>
            {tagsLoading ? (
              <CircularProgress size={24} sx={{ ml: 2, my: 1 }} />
            ) : allTags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', maxWidth: 340 }}>
                {allTags.slice(0, 10).map(tag => (
                  <TagChip
                    label={tag}
                    key={tag}
                    clickable
                    onClick={() => onTagClick(tag)}
                    color={tag === tagFilter ? "secondary" : "default"}
                    sx={tag === tagFilter ? {
                      background: "#e2c066", color: "#111", fontWeight: 700
                    } : undefined}
                  />
                ))}
              </Stack>
            )}
          </FilterBar>
          {loading ? (
            <Box sx={{ textAlign: "center", my: 8 }}>
              <CircularProgress size={54} color="primary" />
              <Typography variant="body1" sx={{ mt: 2, color: "#4263b8" }}>Loading latest articles…</Typography>
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ my: 5 }}>{error}</Typography>
          ) : posts.length === 0 ? (
            <Box sx={{ minHeight: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Typography color="textSecondary" align="center" sx={{ fontStyle: "italic", fontSize: 21, fontWeight: 500 }}>
                No articles found.
              </Typography>
            </Box>
          ) : (
            posts.map((post, idx) => (
              <ArticleCard key={post.id || idx}>
                {post.featuredImage
                  ? <CardImage image={post.featuredImage} title={post.title} />
                  : <CardImage style={{
                    background: "linear-gradient(120deg,#f2faf7,#deeaf5 120%)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }} />
                }
                <ArticleBody>
                  <CardActionArea onClick={() => navigate(`/posts/${post.id}`)}>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: .7, fontSize: 23 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontSize: 16, lineHeight: 1.5, fontWeight: 500, opacity: .88 }}>
                      {post.snippet}
                    </Typography>
                  </CardActionArea>
                  <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                    {(post.tags || []).slice(0, 5).map(t => (
                      <TagChip key={t} label={t} onClick={() => onTagClick(t)} clickable />
                    ))}
                  </Stack>
                  <AuthorBox>
                    <Avatar src={post.author?.avatar || ""} sx={{ width: 32, height: 32, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#3D4668" }}>
                      {post.author?.name || "Unknown"}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ ml: 2 }}>
                      {formatRelativeDate(post.createdAt)}
                    </Typography>
                  </AuthorBox>
                </ArticleBody>
              </ArticleCard>
            ))
          )}
        </FeedPaper>
      </Fade>
    </FeedContainer>
  );
}

export default Feed;
