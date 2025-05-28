import React, { useState, useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Slide,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Visibility, VisibilityOff, PersonAddAlt } from "@mui/icons-material";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Styled components for custom look
const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #e3e6fa 0%, #c6d0f7 100%)",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 420,
  width: "100%",
  borderRadius: 20,
  boxShadow: "0 8px 24px 0 rgba(30,45,80,0.12)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const FooterBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
}));

// PUBLIC_INTERFACE
function Register() {
  const navigate = useNavigate();
  const { setUser, loginSSO } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMsg(null);
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (form.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/register",
        {
          name: form.name,
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
      );
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        setErrorMsg(err.response.data.errors[0]?.msg || "Registration failed");
      } else {
        setErrorMsg("Registration failed. Please try again.");
      }
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // PUBLIC_INTERFACE
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <RegisterContainer>
      <Slide direction="down" in>
        <StyledPaper elevation={3}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <PersonAddAlt color="primary" sx={{ fontSize: 44, mb: 1 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Register for IntraTech Blog
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enter your details to create a new account.
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form style={{ width: "100%" }} onSubmit={handleSubmit} autoComplete="on">
            <FormField
              label="Name"
              name="name"
              type="text"
              variant="outlined"
              fullWidth
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              fullWidth
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <FormField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mt: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: "0 4px 16px 0 rgba(42,67,191,0.10)",
              }}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
            </Button>
          </form>

          <FooterBox>
            <Button
              variant="text"
              color="secondary"
              onClick={loginSSO}
              sx={{ fontWeight: 500, textTransform: "none" }}
            >
              Register with SSO
            </Button>
            <Typography variant="body2" sx={{ alignSelf: "center" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#2A43BF", fontWeight: 600, textDecoration: "none" }}>
                Login
              </Link>
            </Typography>
          </FooterBox>
        </StyledPaper>
      </Slide>
    </RegisterContainer>
  );
}

export default Register;
