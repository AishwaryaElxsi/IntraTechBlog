import React, { useContext, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  Button,
  Stack,
  Divider,
  Alert,
  Snackbar,
  Avatar,
  LinearProgress,
  Fade,
  InputAdornment,
  IconButton
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { styled } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import Showdown from "showdown";
import axios from "axios";

// Styling for layout
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(120deg,#edeff8 0,#f7faee 100%)",
  padding: theme.spacing(6, 1),
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start"
}));
const EditorPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 950,
  width: "100%",
  borderRadius: 20,
  padding: theme.spacing(5, 4),
  boxShadow: "0 14px 40px 0 rgba(37,63,150,0.13)",
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing(4)
}));
const FormSection = styled(Box)(({ theme }) => ({
  flex: 2,
  minWidth: 0
}));
const GuidelineSection = styled(Paper)(({ theme }) => ({
  flex: 1,
  maxWidth: 325,
  padding: theme.spacing(3, 2),
  borderRadius: 18,
  background: "#f6f8fc",
  boxShadow: "0 2px 8px 0 rgba(150,175,210,0.09)",
  marginRight: theme.spacing(1),
  height: "fit-content",
  marginTop: theme.spacing(1)
}));

// Company Guidelines (hardcoded for now)
const BLOG_GUIDELINES = [
  "✅ Focus on technical topics relevant to our company or tech stack.",
  "✅ Use professional and respectful language.",
  "✅ No confidential/customer/private info (review before submitting).",
  "✅ Credit sources and contributors when referencing external work.",
  "✅ Add relevant tags to help others find your post.",
  "✅ Attach a featured image that fits your article (no copyrighted images).",
  "✅ All content is subject to moderation by admins.",
  "⏰ Schedule or save drafts is not yet supported – publish only.",
];

// PUBLIC_INTERFACE
function EditorPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [body, setBody] = useState("");
  const [selectedTab, setSelectedTab] = useState("write");
  const [featuredImgFile, setFeaturedImgFile] = useState(null);
  const [featuredImgDataUrl, setFeaturedImgDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const imgInputRef = useRef();

  // Markdown preview converter
  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    openLinksInNewWindow: true,
  });

  // Auth check
  if (!user) {
    // Fade out while redirecting to Login
    setTimeout(() => navigate("/login"), 1200);
    return (
      <Fade in>
        <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="h5" fontWeight={700} color="textSecondary">
            Checking authentication&hellip;
          </Typography>
        </Box>
      </Fade>
    );
  }

  // Handle tags split
  function getTagsArray() {
    return tagsRaw
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  // Handle image file select and preview
  const handleImageChange = e => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFeaturedImgFile(file);
      // Preview logic
      const reader = new FileReader();
      reader.onload = ev => {
        setFeaturedImgDataUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFeaturedImgFile(null);
    setFeaturedImgDataUrl(null);
    if (imgInputRef.current) imgInputRef.current.value = null;
  };

  // Validate fields present
  function validateRequired() {
    return title.trim() &&
      getTagsArray().length > 0 &&
      body.trim().length > 10;
  }

  // Prepare featured image as base64 string or skip if none
  async function getFeaturedImgString() {
    if (!featuredImgFile) return "";
    // Already loaded in state as dataURL
    return featuredImgDataUrl;
  }

  // PUBLIC_INTERFACE
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");
    setSubmitSuccess("");
    setShowAlert(false);

    try {
      const featuredImage = await getFeaturedImgString();
      const postPayload = {
        title: title.trim(),
        tags: getTagsArray(),
        body: body,
        featuredImage,
        published: true,
      };
      // Send POST to /api/posts (credentials true for jwt cookie)
      await axios.post(
        "/api/posts",
        postPayload,
        { withCredentials: true }
      );
      setSubmitSuccess("Blog published successfully! Redirecting to Feed…");
      setShowAlert(true);
      setTimeout(() => navigate("/feed"), 1550);
    } catch (err) {
      let msg = "Failed to publish. ";
      if (err.response?.data?.error) msg += err.response.data.error;
      setSubmitError(msg);
      setShowAlert(true);
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  return (
    <PageContainer>
      <EditorPaper elevation={4}>
        {/* Guidelines Section */}
        <GuidelineSection elevation={0}>
          <Typography variant="h6" fontWeight={800} gutterBottom color="primary">
            Company Blog Guidelines
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Stack spacing={1.1} sx={{ mt: 2, color: "#324472" }}>
            {BLOG_GUIDELINES.map((g, idx) => (
              <Typography variant="body2" key={idx} sx={{ fontSize: 15, display: "flex", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 700, minWidth: 18, color: g.startsWith("✅") ? "#388e3c" : g.startsWith("⏰") ? "#5f5f71" : "#ad2b27" }}>{g[0]}</span>
                <span style={{ marginLeft: 7 }}>{g.substring(2)}</span>
              </Typography>
            ))}
          </Stack>
        </GuidelineSection>
        {/* Main Form */}
        <FormSection>
          <Typography variant="h4" fontWeight={900} gutterBottom sx={{ letterSpacing: 0.2 }}>
            Create a Tech Blog
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 3 }}>
            Please fill in all required fields. Publishing is only available to authenticated employees.
          </Typography>
          <Box component="form" autoComplete="off" onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <TextField
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              variant="outlined"
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{ style: { fontWeight: 700, fontSize: 22 } }}
              placeholder="What's your tech article about?"
            />
            {/* Tags */}
            <TextField
              label="Tags (comma-separated)"
              value={tagsRaw}
              onChange={e => setTagsRaw(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              required
              helperText="Add up to 8 tags, e.g. node.js,frontend,cloud"
              placeholder="Add relevant tags"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {getTagsArray().map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ ml: 0.5, background: "#f5f3ff", color: "#3d38bb", fontWeight: 600 }}
                      />
                    ))}
                  </InputAdornment>
                )
              }}
            />
            {/* Featured Image */}
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                component="label"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  borderColor: "#a5abc9",
                  background: "#f6fafd"
                }}
                startIcon={<AddPhotoAlternateIcon />}
              >
                {featuredImgFile ? "Change Image" : "Add Featured Image"}
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {featuredImgDataUrl && (
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  <Avatar
                    src={featuredImgDataUrl}
                    alt="featured preview"
                    sx={{ width: 62, height: 62, mr: 1, boxShadow: "0 3px 16px #a5d4fa44" }}
                  />
                  <IconButton onClick={handleRemoveImage} color="error" size="small" title="Remove image">
                    ×
                  </IconButton>
                </Box>
              )}
            </Box>
            {/* Markdown Editor */}
            <Box sx={{ mb: 2 }}>
              <Typography fontWeight={700} gutterBottom>Content <span style={{ color: "#ad2b27" }}>*</span></Typography>
              <ReactMde
                value={body}
                onChange={setBody}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                minEditorHeight={195}
                maxEditorHeight={375}
                generateMarkdownPreview={markdown =>
                  Promise.resolve(converter.makeHtml(markdown))
                }
                childProps={{
                  writeButton: { tabIndex: -1 }
                }}
              />
            </Box>
            {/* Submit / Publish */}
            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 3,
                  fontWeight: 900,
                  fontSize: 18,
                  px: 4,
                  py: 1.2,
                  boxShadow: "0 6px 16px 0 #2a43bf1b"
                }}
                size="large"
                disabled={loading || !validateRequired()}
              >
                {loading ? "Publishing..." : "Publish"}
              </Button>
              {loading && <LinearProgress sx={{ ml: 3, height: 7, borderRadius: 2, flex: 1 }} />}
            </Box>
          </Box>
          {/* Alerts */}
          <Snackbar open={showAlert && (!!submitSuccess || !!submitError)} autoHideDuration={3000} onClose={() => setShowAlert(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            {submitSuccess ? (
              <Alert severity="success" variant="filled">{submitSuccess}</Alert>
            ) : submitError ? (
              <Alert severity="error" variant="filled">{submitError}</Alert>
            ) : null}
          </Snackbar>
        </FormSection>
      </EditorPaper>
    </PageContainer>
  );
}

export default EditorPage;
