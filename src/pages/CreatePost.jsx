import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaImage,
  FaVideo,
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";
import "./CSS/CreatePost.css";
import { getCurrentUser } from "../lib/socialStore";
import { createPostApi, fetchPostById, updatePostApi } from "../api/post";
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <ToastContainer position="top-right" />
      {/* your app */}
    </>
  );
}

const CreatePost = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEditMode = Boolean(postId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");

  const editorRef = useRef(null);
  const token = localStorage.getItem("accessToken");
  const currentUser = getCurrentUser();

  // Load post in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const loadPost = async () => {
      try {
        const post = await fetchPostById(postId);

        if (!post) {
          if (!cancelled) setError("Article not found");
          return;
        }

        if (currentUser?.id !== post.authorId) {
          if (!cancelled) setError("You can edit only your own article");
          return;
        }

        if (!cancelled) {
          setTitle(post.title || "");
          setContent(post.content || "");

          // ✅ Use actual URL (NOT blob)
          if (post.media?.type === "image") setImagePreview(post.media.url);
          if (post.media?.type === "video") setVideoPreview(post.media.url);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Unable to load article.");
        }
      }
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, isEditMode, postId]);

  // Rich text format
  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // ✅ preview only

    setVideoFile(null);
    setVideoPreview(null);
  };

  // Video change
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file)); // ✅ preview only

    setImageFile(null);
    setImagePreview(null);
  };

  // Submit
  const handleSubmit = async () => {
    setError("");

    if (!currentUser) {
      setError("Login required");
      return;
    }

    if (!content.trim() && !imageFile && !videoFile) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // ✅ ONLY send FILE (no blob)
    if (imageFile) formData.append("media", imageFile);
    if (videoFile) formData.append("media", videoFile);

    try {
      if (!token) throw new Error("Login required");

      if (isEditMode) {
        await updatePostApi(postId, formData);
        navigate(`/post/${postId}`);
    } else {
        await createPostApi(formData);
        toast.success('Article posted successfully!');
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <div className="create-wrapper">
      <div className="create-box">
        <div className="create-header">
          <button onClick={() => navigate(-1)}>Cancel</button>
          <span>{isEditMode ? "Edit Article" : "Create Post"}</span>
          <button
            className="post-btn"
            disabled={!content.trim() && !imageFile && !videoFile}
            onClick={handleSubmit}
          >
            {isEditMode ? "Update" : "Post"}
          </button>
        </div>

        <textarea
          placeholder="Give your post a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="rich-text-container">
          <div className="format-toolbar">
            <button onClick={() => handleFormat("bold")}><FaBold /></button>
            <button onClick={() => handleFormat("italic")}><FaItalic /></button>
            <button onClick={() => handleFormat("underline")}><FaUnderline /></button>
            <button onClick={() => handleFormat("justifyLeft")}><FaAlignLeft /></button>
            <button onClick={() => handleFormat("justifyCenter")}><FaAlignCenter /></button>
            <button onClick={() => handleFormat("justifyRight")}><FaAlignRight /></button>
          </div>

          <div
            ref={editorRef}
            className="content-editable-editor"
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        {/* ✅ Preview only */}
        {imagePreview && <img src={imagePreview} className="media-preview" />}
        {videoPreview && (
          <video src={videoPreview} className="media-preview" controls />
        )}

        <div className="create-toolbar">
          <label>
            <FaImage />
            <input hidden type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          <label>
            <FaVideo />
            <input hidden type="file" accept="video/*" onChange={handleVideoChange} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;