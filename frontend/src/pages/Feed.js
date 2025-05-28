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
  Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Styled components for a clean, modern, Medium-like UI
const FeedContainer = styled(Box)(({ theme }) => ({
  background: "#FCFCFC",
  minHeight: "100vh",
  padding: theme.spacing(4, 0),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const FeedPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 820,
  background: "#fff",
  borderRadius: 18,
  padding: theme.spacing(5, 3),
  marginBottom: theme.spacing(4),
  boxShadow: "0 6px 24px 0 rgba(30,45,80,0.10)",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
}));

const ArticleCard = styled(Card)(({ theme }) => ({
  display: "flex",
  borderRadius: 16,
  marginBottom: theme.spacing(3),
  boxShadow: "0 2px 10px 0 rgba(30,45,80,0.06)",
  transition: "box-shadow .22s cubic-bezier(.4,0,.2,1)",
  "&:hover": {
    boxShadow: "0 12px 32px 0 rgba(30,45,80,0.13)",
  }
}));

const CardImage = styled(CardMedia)(({ theme }) => ({
  minWidth: 120,
  width: 120,
  height: 120,
  borderRadius: 12,
  margin: theme.spacing(2),
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

const ArticleBody = styled(CardContent)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 0,
}));

const TagChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  fontWeight: 500,
  background: "#ecedf6",
  color: "#3857B0"
}));

const AuthorBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(2)
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(3),
}));

// PUBLIC_INTERFACE
function Feed() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [error, setError] = useState(null);

  // Tag list for quick filtering (can later move to dynamic, from posts)
  const allTags = Array.from(
    posts.reduce((acc, x) => {
      (x.tags || []).forEach((t) => acc.add(t));
      return acc;
    }, new Set())
  );

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
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFeed();
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

  return (
    <FeedContainer>
      <FeedPaper elevation={3}>
        <FilterBar>
          <Box sx={{ flex: 1 }}>
            <TextField
              variant="outlined"
              placeholder="Search tech blogs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ width: 220, mr: 1 }}
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
              sx={{ mr: 2, textTransform: "none", borderRadius: 2 }}
              onClick={onSearch}
            >
              Search
            </Button>
            {tagFilter && (
              <Chip
                label={`Tag: ${tagFilter}`}
                onDelete={clearFilters}
                sx={{ ml: 1, background: "#F5B544", fontWeight: 600, color: "#fff" }}
              />
            )}
          </Box>
          {allTags.length > 0 && (
            <Stack direction="row" spacing={1}>
              {allTags.slice(0, 8).map(tag => (
                <TagChip
                  label={tag}
                  key={tag}
                  clickable
                  onClick={() => onTagClick(tag)}
                  color={tag === tagFilter ? "secondary" : "default"}
                />
              ))}
            </Stack>
          )}
        </FilterBar>
        {loading ? (
          <Box sx={{ textAlign: "center", my: 8 }}>
            <CircularProgress size={50} />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ my: 5 }}>{error}</Typography>
        ) : posts.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ my: 7 }}>
            No articles found.
          </Typography>
        ) : (
          posts.map((post) => (
            <ArticleCard key={post.id}>
              {post.featuredImage &&
                <CardImage image={post.featuredImage} title={post.title} />
              }
              <ArticleBody>
                <CardActionArea onClick={() => navigate(`/posts/${post.id}`)}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {post.snippet}
                  </Typography>
                </CardActionArea>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  {(post.tags || []).slice(0, 5).map(t => (
                    <TagChip key={t} label={t} onClick={() => onTagClick(t)} clickable />
                  ))}
                </Stack>
                <AuthorBox>
                  <Avatar src={post.author?.avatar || ""} sx={{ width: 30, height: 30, mr: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    {post.author?.name || "Unknown"} &nbsp;
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ ml: 2 }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                </AuthorBox>
              </ArticleBody>
            </ArticleCard>
          ))
        )}
      </FeedPaper>
    </FeedContainer>
  );
}

export default Feed;
