import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaImage, FaVideo, FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import "./CSS/CreatePost.css";
import { getCurrentUser } from "../lib/socialStore";
import { createPostApi, fetchPostById, updatePostApi } from "../api/post";

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

  // Sync content state to the editor once when loading in edit mode
  useEffect(() => {
    if (isEditMode && editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [isEditMode, content]);

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    // Manually trigger state update because execCommand doesn't fire onInput automatically in all browsers
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

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
          if (post.media?.type === "image") setImagePreview(post.media.url);
          if (post.media?.type === "video") setVideoPreview(post.media.url);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.response?.data?.message || "Unable to load article.");
        }
      }
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, isEditMode, postId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    setError("");

    if (!currentUser) {
      setError("Login required");
      return;
    }

    if (!content.trim() && !imageFile && !videoFile) return;

    const mediaPayload = imagePreview
      ? { type: "image", url: imagePreview }
      : videoPreview
        ? { type: "video", url: videoPreview }
        : null;

    if (isEditMode) {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("mediaUrl", mediaPayload?.url || "");
      if (imageFile) formData.append("media", imageFile);
      if (videoFile) formData.append("media", videoFile);

      try {
        if (!token) {
          throw new Error("Login required for database update");
        }
        await updatePostApi(postId, formData);
        navigate(`/post/${postId}`);
      } catch (updateError) {
        setError(
          updateError.response?.data?.message ||
            updateError.message ||
            "Unable to update article."
        );
      }
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (imageFile) formData.append("media", imageFile);
    if (videoFile) formData.append("media", videoFile);

    try {
      if (!token) {
        throw new Error("Login required for database create");
      }
      await createPostApi(formData);
      navigate("/home");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to create post right now."
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
            <button type="button" onClick={() => handleFormat("bold")} title="Bold"><FaBold /></button>
            <button type="button" onClick={() => handleFormat("italic")} title="Italic"><FaItalic /></button>
            <button type="button" onClick={() => handleFormat("underline")} title="Underline"><FaUnderline /></button>
            <span className="toolbar-divider"></span>
            <button type="button" onClick={() => handleFormat("justifyLeft")} title="Align Left"><FaAlignLeft /></button>
            <button type="button" onClick={() => handleFormat("justifyCenter")} title="Align Center"><FaAlignCenter /></button>
            <button type="button" onClick={() => handleFormat("justifyRight")} title="Align Right"><FaAlignRight /></button>
          </div>

          <div
            ref={editorRef}
            className="content-editable-editor"
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            onBlur={(e) => setContent(e.currentTarget.innerHTML)}
            data-placeholder="What do you want to share?"
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

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
