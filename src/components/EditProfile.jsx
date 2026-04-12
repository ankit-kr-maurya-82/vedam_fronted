import React, { useContext, useState } from "react";
import UserContext from "../context/UserContext";
import "./CSS/EditProfile.css";
import { updateProfile } from "../api/profile";

const EditProfile = ({ onClose, onProfileUpdated }) => {
  const { user, setUser } = useContext(UserContext);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) {
      setError("Full name and username are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { user: updatedUser } = await updateProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        avatarFile,
      });

      setUser(updatedUser);
      onProfileUpdated?.(updatedUser);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>

        <h2>Edit Profile</h2>

        <div className="edit-avatar">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" />
          ) : (
            <div className="avatar-fallback">
              {username?.charAt(0).toUpperCase()}
            </div>
          )}

          <label>
            Change
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="edit-fields">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" maxLength={160} />
        </div>

        {error && <p className="edit-profile-error">{error}</p>}

        <div className="edit-actions">
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfile;