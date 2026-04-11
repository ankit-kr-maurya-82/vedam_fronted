import React, { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";
import "./CSS/EditProfile.css";
import { updateLocalUserProfile } from "../lib/socialStore";
import { updateProfile } from "../api/profile";

const EditProfile = ({ onClose, onProfileUpdated }) => {
  const { user, setUser } = useContext(UserContext);

  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (avatarFile && avatar.startsWith("blob:")) {
        URL.revokeObjectURL(avatar);
      }
    };
  }, [avatar, avatarFile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (avatarFile && avatar.startsWith("blob:")) {
      URL.revokeObjectURL(avatar);
    }

    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async () => {
    const normalizedFullName = fullName.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedBio = bio.trim();

    if (!normalizedFullName || !normalizedUsername) {
      setError("Full name and username are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { user: updatedUser } = await updateProfile({
        fullName: normalizedFullName,
        username: normalizedUsername,
        bio: normalizedBio,
        avatarFile,
      });

      setUser(updatedUser);
      updateLocalUserProfile(updatedUser);
      onProfileUpdated?.(updatedUser);
      onClose();
    } catch (saveError) {
      if (saveError.response) {
        setError(
          saveError.response?.data?.message ||
            "Unable to update profile."
        );
        return;
      }

      const fallbackUser = updateLocalUserProfile({
        fullName: normalizedFullName,
        username: normalizedUsername,
        bio: normalizedBio,
        ...(avatarFile ? { avatar } : {}),
      });

      if (fallbackUser) {
        setUser(fallbackUser);
        onProfileUpdated?.(fallbackUser);
        onClose();
        return;
      }

      setError(
        saveError.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div
        className="edit-profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit Profile</h2>

        <div className="edit-avatar">
          {avatar ? (
            <img src={avatar} alt="avatar" />
          ) : (
            <div className="avatar-fallback">
              {username.charAt(0).toUpperCase()}
            </div>
          )}

          <label>
            Change
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="edit-fields">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <textarea
            placeholder="Bio"
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {error && <p className="edit-profile-error">{error}</p>}

        <div className="edit-actions">
          <button className="cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
