import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Fade,
  Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
// Reusable styled components
const ProfileContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(140deg,#f2f6ff 0,#e7f4fb 100%)",
  padding: theme.spacing(5, 2)
}));
const ProfilePaper = styled(Paper)(({ theme }) => ({
  maxWidth: 860,
  margin: "0 auto",
  borderRadius: 20,
  padding: theme.spacing(5, 4),
  boxShadow: "0 14px 38px 0 rgba(44,80,180,0.13)",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3)
}));
const AuthorHeader = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(2)
}));
const BioBox = styled(Box)(({ theme }) => ({
  background: "#fafdfe",
  borderRadius: 14,
  padding: theme.spacing(2, 3),
  minHeight: 54,
  border: "1.5px solid #e0e9fa",
  fontSize: 16,
  color: "#425394"
}));
const StatBox = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  gap: theme.spacing(5),
  alignItems: "center",
  marginTop: theme.spacing(2)
}));
const BlogList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2)
}));
const BlogItemPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 2),
  marginBottom: theme.spacing(2.5),
  borderRadius: 14,
  boxShadow: "0 3px 18px 0 rgba(80,90,150,0.07)",
  cursor: "pointer",
  transition: "box-shadow .22s cubic-bezier(.4,0,.2,1), transform .16s cubic-bezier(.4,0,.2,1)",
  "&:hover": {
    boxShadow: "0 10px 28px 0 rgba(44,80,180,0.10)",
    background: "#f5f6fa"
  }
}));
const CoverThumb = styled("img")(({ theme }) => ({
  width: 68, height: 68, borderRadius: 9, objectFit: "cover",
  background: "#e7eaf1",
  boxShadow: "0 2px 7px 0 #b3c7ed22"
}));
const EngagementSummary = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
  marginTop: theme.spacing(1.2),
  fontSize: 15,
  color: "#6872a5"
}));

// Helper function for relative date
function formatRelativeDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const mins = Math.floor((now - d) / (1000 * 60));
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 10) return `${days} day${days > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString();
}

/**
 * Profile page (other employee or self).
 *
 * - If /profile or no id param: show own profile (from context or self API).
 * - If /profile/:id: show that user's profile and published blogs.
 * - Show follow/unfollow button & status if not own profile.
 * - Integrate follow/unfollow backend, and update follower/following counts.
 */
function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Detect profile being viewed: id param or self
  // If /profile/:id, the param "id" exists; else it's own profile
  const otherUserId = params.id;

  // Profile state (profile is the *viewed* user, user is logged-in user)
  const [profile, setProfile] = useState(null); // user object for displayed profile
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState({ totalClaps: 0, totalComments: 0 });
  const [tab, setTab] = useState(0);

  // Follower/following info
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [iFollow, setIFollow] = useState(false); // Current user follows this profile?
  const [actionPending, setActionPending] = useState(false);

  // Feedback snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Refetch when viewing different profile or user changes
  useEffect(() => {
    if (!user) {
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    fetchProfileAndArticles();
    // eslint-disable-next-line
  }, [otherUserId, user]);

  // Fetch info: for own profile or other
  const fetchProfileAndArticles = async () => {
    setLoading(true);
    try {
      let profileData, showOwn;
      let followers = 0, following = 0, iFollowNow = false, blogsArr = [];
      let resp;
      if (!otherUserId || (user && (user.id === otherUserId || user._id === otherUserId))) {
        // Viewing own profile (from context is sufficient)
        showOwn = true;
        profileData = user;
        followers = user?.followers || 0;
        following = user?.following || 0;
      } else {
        // Viewing another user's profile by id
        showOwn = false;
        // Fetch user profile, followers/ing counts, and check if current user follows them
        // 1. Profile: GET /api/users/{id}
        resp = await axios.get(`/api/users/${otherUserId}`, { withCredentials: true });
        profileData = {
          ...resp.data.user,
        };
        // 2. Followers count/list
        const followersRes = await axios.get(`/api/users/${otherUserId}/followers`, { withCredentials: true });
        followers = followersRes.data.count;
        // 3. Following count/list
        const followingRes = await axios.get(`/api/users/${otherUserId}/following`, { withCredentials: true });
        following = followingRes.data.count;
        // 4. Does logged-in user follow this user?
        if (followersRes.data && followersRes.data.followers && user) {
          iFollowNow = followersRes.data.followers.some(u => u.id === user.id || u._id === user.id);
        }
      }

      // Blogs posted by this profile (filter tech-only)
      const postsRes = await axios.get("/api/posts?author=" + encodeURIComponent(profileData.id || profileData._id || otherUserId), { withCredentials: true });
      let posts = postsRes.data.posts || [];
      const TECH_TAGS = [
        "tech", "engineering", "development", "dev", "software", "backend", "frontend", "cloud", "security", "code", "architecture"
      ];
      posts = posts.filter(
        p =>
          p.author &&
          ((p.author.id && (p.author.id === (profileData.id || profileData._id)))
            || (p.author._id && (p.author._id === (profileData.id || profileData._id))))
          &&
          (p.tags || []).some(tag => TECH_TAGS.includes(tag.toLowerCase()))
      );
      blogsArr = posts;

      // Compute engagement summary (likes, comments)
      let totalClaps = 0, totalComments = 0;
      await Promise.all(
        blogsArr.map(async post => {
          try {
            let detail = await axios.get(`/api/posts/${post.id}`, { withCredentials: true });
            post.likes = detail.data.likes || [];
            post.reactions = detail.data.reactions || [];
            totalClaps += post.likes.length;
            let commentCountRes = await axios.get(`/api/comments?post=${post.id}`, { withCredentials: true });
            post.commentCount = (commentCountRes.data.comments || []).length;
            totalComments += post.commentCount;
          } catch {}
        })
      );

      setProfile(profileData);
      setBlogs(blogsArr);
      setFollowersCount(followers);
      setFollowingCount(following);
      setEngagement({ totalClaps, totalComments });
      setIFollow(iFollowNow);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to load profile.", severity: "error" });
      setProfile(null);
      setBlogs([]);
      setFollowersCount(0);
      setFollowingCount(0);
      setEngagement({ totalClaps: 0, totalComments: 0 });
    }
    setLoading(false);
  };

  // Follow button click
  const handleFollow = async () => {
    if (!user || !profile) return;
    setActionPending(true);
    try {
      await axios.post(`/api/users/${profile.id || profile._id}/follow`, {}, { withCredentials: true });
      setIFollow(true);
      setFollowersCount(fc => fc + 1);
      setSnackbar({ open: true, message: "Now following.", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.error || "Failed to follow.", severity: "error" });
    }
    setActionPending(false);
  };
  // Unfollow button click
  const handleUnfollow = async () => {
    if (!user || !profile) return;
    setActionPending(true);
    try {
      await axios.post(`/api/users/${profile.id || profile._id}/unfollow`, {}, { withCredentials: true });
      setIFollow(false);
      setFollowersCount(fc => (fc > 0 ? fc - 1 : 0));
      setSnackbar({ open: true, message: "Unfollowed.", severity: "info" });
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.error || "Failed to unfollow.", severity: "error" });
    }
    setActionPending(false);
  };

  // Handle tab change
  const handleTab = (event, v) => setTab(v);

  // Basic guards
  if (!user) {
    return (
      <ProfileContainer>
        <ProfilePaper>
          <Box sx={{ textAlign: "center", mt: 14, mb: 12 }}>
            <CircularProgress size={44} />
            <Typography sx={{ mt: 3 }} color="text.secondary">Checking authentication…</Typography>
          </Box>
        </ProfilePaper>
      </ProfileContainer>
    );
  }
  if (loading) {
    return (
      <ProfileContainer>
        <ProfilePaper>
          <Fade in>
            <Box sx={{ textAlign: "center", mt: 12, mb: 14 }}>
              <CircularProgress size={50} color="primary" />
            </Box>
          </Fade>
        </ProfilePaper>
      </ProfileContainer>
    );
  }
  if (!profile) {
    return (
      <ProfileContainer>
        <ProfilePaper>
          <Typography sx={{ my: 16 }} color="error" align="center">Profile not found.</Typography>
        </ProfilePaper>
      </ProfileContainer>
    );
  }

  // Self view: don't show follow button
  const isSelf = user && profile && (user.id === profile.id || user.id === profile._id);

  // Render follow/unfollow button (not for self)
  let followBtn = null;
  if (!isSelf) {
    followBtn =
      iFollow ? (
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleUnfollow}
          disabled={actionPending}
          sx={{ fontWeight: 700, borderRadius: 2, minWidth: 136, ml: 1, my: .7 }}
        >
          Unfollow
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleFollow}
          disabled={actionPending}
          sx={{ fontWeight: 700, borderRadius: 2, minWidth: 136, ml: 1, my: .7 }}
        >
          Follow
        </Button>
      );
  }

  return (
    <ProfileContainer>
      <Fade in>
        <ProfilePaper>
          <AuthorHeader>
            <Avatar
              src={profile?.avatar || ""}
              sx={{ width: 82, height: 82, boxShadow: "0 3px 18px #a5b8f844", border: "3px solid #e8f0ff" }}
              alt={profile?.name || "Avatar"}
            />
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 0.2, color: "#273a7e" }}>
                {profile?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: .4, fontWeight: 500, letterSpacing: 0.15 }}>
                {profile?.email}
              </Typography>
              <StatBox>
                <Box>
                  <Typography variant="h6" color="primary" fontWeight={800}>{blogs.length}</Typography>
                  <Typography sx={{ fontSize: 15, opacity: .84 }}>Blogs Published</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="secondary" fontWeight={800}>{followersCount}</Typography>
                  <Typography sx={{ fontSize: 15, opacity: .84 }}>Followers</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="secondary" fontWeight={800}>{followingCount}</Typography>
                  <Typography sx={{ fontSize: 15, opacity: .84 }}>Following</Typography>
                </Box>
                {!isSelf && (
                  <Box>
                    {followBtn}
                    {/* Relationship indicator */}
                  </Box>
                )}
              </StatBox>
            </Box>
          </AuthorHeader>
          {profile?.bio && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Bio
              </Typography>
              <BioBox>
                {profile.bio}
              </BioBox>
            </>
          )}
          <EngagementSummary>
            <Box>
              <span style={{ fontWeight: 700, color: "#3a479a" }}>{engagement.totalClaps}</span> total claps
            </Box>
            <Box>
              <span style={{ fontWeight: 700, color: "#b98221" }}>{engagement.totalComments}</span> comments received
            </Box>
          </EngagementSummary>
          <Divider sx={{ mt: 2, mb: 2 }} />
          <Tabs value={tab} onChange={handleTab} sx={{ minHeight: 40 }}>
            <Tab label="Published Tech Blogs" sx={{ fontWeight: 700, fontSize: 16, textTransform: "none" }} />
          </Tabs>
          <BlogList>
            {tab === 0 && (
              blogs.length === 0 ? (
                <Typography sx={{ fontStyle: "italic", mt: 4, color: "#868fab" }}>
                  No published tech blogs yet.
                </Typography>
              ) : (
                blogs.map(post => (
                  <BlogItemPaper key={post.id} onClick={() => navigate(`/posts/${post.id}`)}>
                    {post.featuredImage ? (
                      <CoverThumb src={post.featuredImage} alt="cover" />
                    ) : (
                      <CoverThumb style={{ background: "#eff2fb" }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: .5 }}>{post.title}</Typography>
                      <Stack spacing={.5} direction="row" sx={{ mb: 1, flexWrap: 'wrap' }}>
                        {(post.tags || []).map(tag => (
                          <Chip
                            label={tag}
                            key={tag}
                            size="small"
                            sx={{ background: "#eeeff9", color: "#2a43bf", fontWeight: 700, mr: .7, mb: .4 }}
                          />
                        ))}
                      </Stack>
                      <Typography color="text.secondary" sx={{
                        fontSize: 15, maxHeight: 46, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                      }}>
                        {post.snippet}
                      </Typography>
                      <Stack direction="row" spacing={3} sx={{ mt: .9 }}>
                        <Box sx={{ fontSize: 14, color: "#4269a3" }}>
                          {post.likes ? post.likes.length : 0} claps
                        </Box>
                        <Box sx={{ fontSize: 14, color: "#a48f44" }}>
                          {post.commentCount || 0} comments
                        </Box>
                        <Box sx={{ fontSize: 14, color: "#888" }}>
                          {formatRelativeDate(post.createdAt)}
                        </Box>
                      </Stack>
                    </Box>
                  </BlogItemPaper>
                ))
              )
            )}
          </BlogList>
          <Box sx={{ textAlign: "center", mt: 3, mb: -2 }}>
            {isSelf ? (
              <Button
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 700, borderRadius: 3, px: 4, textTransform: "none", boxShadow: "none" }}
                disabled
                title="Profile editing coming soon"
              >Edit Profile (coming soon)</Button>
            ) : null}
          </Box>
        </ProfilePaper>
      </Fade>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </ProfileContainer>
  );
}

export default Profile;
