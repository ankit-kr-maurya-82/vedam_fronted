import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./index.css";
import Explore from "./pages/Explore";
import CreatePost from "./pages/CreatePost";
import Chat from "./pages/Chat";
import PostPage from "./pages/PostPage";
import About from "./pages/About";
import Features from "./pages/Features";
import VedHome from "./pages/VedHome";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminUserDetail from "./pages/AdminUserDetail";
import ContactUs from "./pages/ContactUs";


function App() {
  return (
    <div className="main">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route index element={<VedHome />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="login" element={<Login />} />
<Route path="register" element={<Register />} />
<Route path="admin-login" element={<AdminLogin />} />
<Route path="admin-register" element={<AdminRegister />} />
          <Route path="explore" element={<Explore />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="edit/:postId" element={<CreatePost />} />
          <Route path="chat" element={<Chat />} />
          <Route path="post/:postId" element={<PostPage />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/user/:id" element={<AdminUserDetail />} />
          <Route path="contact" element={<ContactUs />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
