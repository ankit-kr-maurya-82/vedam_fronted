import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBell,
  FaBookmark,
  FaDownload,
  FaMoon,
  FaPalette,
  FaSave,
  FaShieldAlt,
  FaSignOutAlt,
  FaSun,
  FaUserEdit,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { toast } from "react-toastify";
import {
  fetchPushPublicKey,
  removePushSubscription,
  savePushSubscription,
} from "../api/pushNotifications";
import PWAContext from "../context/PWAContext";
import UserContext from "../context/UserContext";
import useTheme from "../context/theme";
import {
  getExistingPushSubscription,
  getPushPermissionState,
  isPushSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "../lib/pushNotifications";
import { updateProfile } from "../api/profile";
import { updateLocalUserProfile } from "../lib/socialStore";
import "./CSS/Setting.css";

const SETTINGS_STORAGE_KEY = "social_settings_preferences";

const defaultPreferences = {
  emailDigest: true,
  commentAlerts: true,
  autoplayMedia: false,
  compactReading: false,
  profileVisibility: "public",
  contentFilter: "balanced",
};

const readStoredPreferences = () => {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw
      ? { ...defaultPreferences, ...JSON.parse(raw) }
      : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
};

const Setting = () => {
  const { user, setUser, logout } = useContext(UserContext);
  const {
    isPwaSupported,
    isInstalled,
    isInstallAvailable,
    isOfflineReady,
    isUpdateAvailable,
    promptInstall,
    applyUpdate,
    checkForUpdates,
  } = useContext(PWAContext);
  const { themeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = themeMode === "dark";

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    username: "",
    bio: "",
  });
  const [savedPreferences, setSavedPreferences] = useState(readStoredPreferences);
  const [preferences, setPreferences] = useState(readStoredPreferences);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [checkingDevicePush, setCheckingDevicePush] = useState(true);
  const [savingDevicePush, setSavingDevicePush] = useState(false);
  const [devicePushEnabled, setDevicePushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState(getPushPermissionState);
  const [installingPwa, setInstallingPwa] = useState(false);
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const supportsDevicePush = useMemo(() => isPushSupported(), []);

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || "",
      username: user?.username || "",
      bio: user?.bio || "",
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const syncDevicePushState = async () => {
      setPushPermission(getPushPermissionState());

      if (!user || !supportsDevicePush) {
        if (!cancelled) {
          setDevicePushEnabled(false);
          setCheckingDevicePush(false);
        }
        return;
      }

      setCheckingDevicePush(true);

      try {
        const subscription = await getExistingPushSubscription();

        if (subscription) {
          await savePushSubscription(
            subscription.toJSON ? subscription.toJSON() : subscription
          );
        }

        if (!cancelled) {
          setDevicePushEnabled(Boolean(subscription));
          setPushPermission(getPushPermissionState());
        }
      } catch {
        if (!cancelled) {
          setDevicePushEnabled(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingDevicePush(false);
        }
      }
    };

    syncDevicePushState();

    return () => {
      cancelled = true;
    };
  }, [supportsDevicePush, user]);

  const profileCompletion = useMemo(() => {
    if (!user) return 0;

    const completedFields = [
      Boolean(user.fullName),
      Boolean(user.username),
      Boolean(user.bio),
      Boolean(user.email),
    ].filter(Boolean).length;

    return Math.round((completedFields / 4) * 100);
  }, [user]);

  const preferenceChanged =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const handleProfileFieldChange = (field) => (event) => {
    const value = event.target.value;
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handlePreferenceToggle = (field) => (event) => {
    const value = event.target.checked;
    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handlePreferenceSelect = (field) => (event) => {
    const value = event.target.value;
    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const nextProfile = {
      fullName: profileForm.fullName.trim(),
      username: profileForm.username.trim().toLowerCase(),
      bio: profileForm.bio.trim(),
    };

    if (!nextProfile.fullName || !nextProfile.username) {
      toast.error("Full name and username are required.");
      return;
    }

    setSavingProfile(true);

    try {
      const result = await updateProfile(nextProfile);
      setUser(result.user);
      setProfileForm({
        fullName: result.user?.fullName || "",
        username: result.user?.username || "",
        bio: result.user?.bio || "",
      });
      toast.success(result.message || "Profile updated successfully.");
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response?.data?.message || "We could not save your profile."
        );
      } else {
        const updatedUser = updateLocalUserProfile(nextProfile);
        if (!updatedUser) {
          toast.error("Unable to save profile right now.");
        } else {
          setUser(updatedUser);
          setProfileForm({
            fullName: updatedUser?.fullName || "",
            username: updatedUser?.username || "",
            bio: updatedUser?.bio || "",
          });
          toast.success("Profile updated locally.");
        }
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = () => {
    setSavingPreferences(true);

    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(preferences)
      );
      setSavedPreferences(preferences);
      toast.success("Settings preferences saved.");
    } catch {
      toast.error("Unable to save preferences on this device.");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleResetPreferences = () => {
    setPreferences(defaultPreferences);
    setSavedPreferences(defaultPreferences);
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(defaultPreferences)
    );
    toast.success("Preferences reset to default.");
  };

  const handleEnableDevicePush = async () => {
    if (!supportsDevicePush) {
      toast.error("This browser does not support device push notifications.");
      return;
    }

    setSavingDevicePush(true);

    try {
      const publicKey = await fetchPushPublicKey();
      if (!publicKey) {
        throw new Error("Push public key is missing on the server.");
      }

      const subscription = await subscribeToPushNotifications(publicKey);
      await savePushSubscription(
        subscription.toJSON ? subscription.toJSON() : subscription
      );

      setDevicePushEnabled(true);
      setPushPermission(getPushPermissionState());
      toast.success("Device notifications enabled on this browser.");
    } catch (error) {
      setPushPermission(getPushPermissionState());
      console.error("Device push enable failed:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to enable device notifications."
      );
    } finally {
      setSavingDevicePush(false);
      setCheckingDevicePush(false);
    }
  };

  const handleDisableDevicePush = async () => {
    setSavingDevicePush(true);

    try {
      const existingSubscription = await getExistingPushSubscription();
      const endpoint = existingSubscription?.endpoint || "";

      await unsubscribeFromPushNotifications();

      if (endpoint) {
        await removePushSubscription(endpoint);
      }

      setDevicePushEnabled(false);
      setPushPermission(getPushPermissionState());
      toast.success("Device notifications disabled for this browser.");
    } catch (error) {
      console.error("Device push disable failed:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to disable device notifications."
      );
    } finally {
      setSavingDevicePush(false);
      setCheckingDevicePush(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInstallApp = async () => {
    setInstallingPwa(true);

    try {
      const installed = await promptInstall();

      if (!installed) {
        toast.info("Install prompt was dismissed.");
      }
    } catch {
      toast.error("Unable to open the install prompt right now.");
    } finally {
      setInstallingPwa(false);
    }
  };

  const handleCheckForUpdates = async () => {
    setCheckingForUpdate(true);

    try {
      await checkForUpdates();
      toast.success(
        "Checked for updates. If a new version is available, the update button will appear."
      );
    } catch {
      toast.error("Unable to check for updates right now.");
    } finally {
      setCheckingForUpdate(false);
    }
  };

  if (!user) {
    return (
      <section className="settings-page">
        <div className="settings-shell">
          <div className="settings-empty-state">
            <IoMdSettings />
            <h1>Settings are available after login</h1>
            <p>
              Sign in to manage your profile, appearance, and reading
              preferences.
            </p>
            <Link to="/login" className="settings-primary-link">
              Go to login <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="settings-page">
      <div className="settings-shell">
        <header className="settings-hero">
          <div className="settings-hero-copy">
            <span className="settings-kicker">Account settings</span>
            <h1>Shape your profile and tune how the app feels.</h1>
            <p>
              Update your public identity, switch the interface theme, and save
              the reading preferences you want on this device.
            </p>
          </div>

          <aside className="settings-hero-card">
            <div className="settings-user-row">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="settings-avatar"
                />
              ) : (
                <div className="settings-avatar fallback">
                  {user.username?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div>
                <strong>{user.fullName || user.username}</strong>
                <span>@{user.username}</span>
              </div>
            </div>

            <div className="settings-progress-block">
              <div className="settings-progress-head">
                <span>Profile completeness</span>
                <b>{profileCompletion}%</b>
              </div>
              <div className="settings-progress-track">
                <span style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>

            <div className="settings-stat-grid">
              <article>
                <strong>{user.followers || 0}</strong>
                <span>Followers</span>
              </article>
              <article>
                <strong>{user.following || 0}</strong>
                <span>Following</span>
              </article>
              <article>
                <strong>{user.role || "user"}</strong>
                <span>Role</span>
              </article>
            </div>
          </aside>
        </header>

        <div className="settings-grid">
          <form className="settings-card settings-form-card" onSubmit={handleSaveProfile}>
            <div className="settings-card-head">
              <div>
                <span className="settings-card-kicker">
                  <FaUserEdit /> Profile
                </span>
                <h2>Public account details</h2>
              </div>
              <p>
                These fields shape how other readers see you across articles,
                comments, and profile pages.
              </p>
            </div>

            <label>
              Full name
              <input
                type="text"
                value={profileForm.fullName}
                onChange={handleProfileFieldChange("fullName")}
                placeholder="Your full name"
              />
            </label>

            <label>
              Username
              <input
                type="text"
                value={profileForm.username}
                onChange={handleProfileFieldChange("username")}
                placeholder="your_username"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={user.email || ""}
                disabled
                placeholder="Email address"
              />
            </label>

            <label>
              Bio
              <textarea
                value={profileForm.bio}
                onChange={handleProfileFieldChange("bio")}
                maxLength={160}
                placeholder="Tell people what you are building or writing about."
              />
            </label>

            <div className="settings-inline-note">
              <FaShieldAlt />
              <span>
                Profile edits try the backend first and fall back to local
                storage when the server is unavailable.
              </span>
            </div>

            <button type="submit" className="settings-primary-btn" disabled={savingProfile}>
              <FaSave />
              {savingProfile ? "Saving profile..." : "Save profile"}
            </button>
          </form>

          <div className="settings-column">
            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <span className="settings-card-kicker">
                    <FaDownload /> App install
                  </span>
                  <h2>PWA install, offline use, and updates</h2>
                </div>
                <p>
                  Install Vedam like an app, keep core pages cached, and update
                  quickly when a new version is ready.
                </p>
              </div>

              <div className="settings-push-panel">
                <div className="settings-push-status-row">
                  <div>
                    <strong>
                      {!isPwaSupported
                        ? "PWA not supported"
                        : isInstalled
                          ? "Installed on this device"
                          : isInstallAvailable
                            ? "Ready to install"
                            : "Open in a supported browser"}
                    </strong>
                    <span>
                      {isOfflineReady
                        ? "Offline cache is ready for your main app shell."
                        : "Preparing offline support for this browser."}
                    </span>
                  </div>

                  <span
                    className={`settings-push-badge ${
                      isInstalled || isOfflineReady ? "enabled" : ""
                    }`}
                  >
                    {isInstalled ? "App" : isOfflineReady ? "Ready" : "Web"}
                  </span>
                </div>

                <div className="settings-pwa-grid">
                  <article className="settings-pwa-item">
                    <strong>Install prompt</strong>
                    <span>
                      {isInstallAvailable
                        ? "You can add Vedam to your home screen or desktop now."
                        : "The browser will show install support when eligible."}
                    </span>
                  </article>
                  <article className="settings-pwa-item">
                    <strong>Cached pages</strong>
                    <span>
                      Home shell, manifest, and static assets stay available
                      offline after first load.
                    </span>
                  </article>
                  <article className="settings-pwa-item">
                    <strong>Update prompt</strong>
                    <span>
                      {isUpdateAvailable
                        ? "A newer version is waiting and can be applied now."
                        : "The app will alert you when a fresh build is ready."}
                    </span>
                  </article>
                </div>

                <div className="settings-action-row">
                  <button
                    type="button"
                    className="settings-primary-btn"
                    onClick={handleInstallApp}
                    disabled={
                      installingPwa || !isPwaSupported || !isInstallAvailable
                    }
                  >
                    <FaDownload />
                    {installingPwa ? "Opening..." : "Install app"}
                  </button>
                  <button
                    type="button"
                    className="settings-secondary-btn"
                    onClick={isUpdateAvailable ? applyUpdate : handleCheckForUpdates}
                    disabled={checkingForUpdate || !isPwaSupported}
                  >
                    {isUpdateAvailable
                      ? "Update app"
                      : checkingForUpdate
                        ? "Checking..."
                        : "Check for updates"}
                  </button>
                </div>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <span className="settings-card-kicker">
                    <FaBell /> Device notifications
                  </span>
                  <h2>Push alerts on laptop and mobile</h2>
                </div>
                <p>
                  Get message alerts even when this tab is closed, as long as
                  your browser supports web push.
                </p>
              </div>

              <div className="settings-push-panel">
                <div className="settings-push-status-row">
                  <div>
                    <strong>
                      {!supportsDevicePush
                        ? "Not supported"
                        : checkingDevicePush
                          ? "Checking device status"
                          : devicePushEnabled
                            ? "Enabled on this device"
                            : "Disabled on this device"}
                    </strong>
                    <span>
                      Permission:{" "}
                      {pushPermission === "granted"
                        ? "granted"
                        : pushPermission === "denied"
                          ? "blocked"
                          : pushPermission}
                    </span>
                  </div>

                  <span
                    className={`settings-push-badge ${
                      devicePushEnabled ? "enabled" : ""
                    }`}
                  >
                    {devicePushEnabled ? "On" : "Off"}
                  </span>
                </div>

                <p className="settings-push-note">
                  On iPhone or iPad, push notifications usually work after you
                  add this app to the home screen and allow notifications in
                  Safari.
                </p>

                <div className="settings-action-row">
                  <button
                    type="button"
                    className="settings-primary-btn"
                    onClick={handleEnableDevicePush}
                    disabled={
                      savingDevicePush || checkingDevicePush || !supportsDevicePush
                    }
                  >
                    <FaBell />
                    {savingDevicePush && !devicePushEnabled
                      ? "Enabling..."
                      : "Enable device notifications"}
                  </button>
                  <button
                    type="button"
                    className="settings-secondary-btn"
                    onClick={handleDisableDevicePush}
                    disabled={savingDevicePush || checkingDevicePush || !devicePushEnabled}
                  >
                    {savingDevicePush && devicePushEnabled
                      ? "Disabling..."
                      : "Disable on this device"}
                  </button>
                </div>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <span className="settings-card-kicker">
                    <FaPalette /> Appearance
                  </span>
                  <h2>Theme and interface</h2>
                </div>
                <p>
                  Switch between light and dark mode instantly from this panel.
                </p>
              </div>

              <div className="settings-theme-row">
                <div>
                  <strong>{isDark ? "Dark mode" : "Light mode"}</strong>
                  <span>
                    The whole application updates immediately when you switch.
                  </span>
                </div>
                <button
                  type="button"
                  className="settings-secondary-btn"
                  onClick={toggleTheme}
                >
                  {isDark ? <FaSun /> : <FaMoon />}
                  {isDark ? "Use light mode" : "Use dark mode"}
                </button>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <span className="settings-card-kicker">
                    <FaBell /> Preferences
                  </span>
                  <h2>Reading and notification choices</h2>
                </div>
                <p>
                  These preferences are saved on this browser to personalize
                  your experience.
                </p>
              </div>

              <div className="settings-toggle-list">
                <label className="settings-toggle-row">
                  <div>
                    <strong>Email digest</strong>
                    <span>Keep weekly writing and feature highlights enabled.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailDigest}
                    onChange={handlePreferenceToggle("emailDigest")}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Comment alerts</strong>
                    <span>Show alerts when readers reply to your conversations.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.commentAlerts}
                    onChange={handlePreferenceToggle("commentAlerts")}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Autoplay media</strong>
                    <span>Automatically start supported media inside articles.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoplayMedia}
                    onChange={handlePreferenceToggle("autoplayMedia")}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Compact reading view</strong>
                    <span>Prefer tighter cards and denser lists while browsing.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.compactReading}
                    onChange={handlePreferenceToggle("compactReading")}
                  />
                </label>
              </div>

              <div className="settings-select-grid">
                <label>
                  Profile visibility
                  <select
                    value={preferences.profileVisibility}
                    onChange={handlePreferenceSelect("profileVisibility")}
                  >
                    <option value="public">Public</option>
                    <option value="followers">Followers only</option>
                    <option value="private">Private</option>
                  </select>
                </label>

                <label>
                  Content filter
                  <select
                    value={preferences.contentFilter}
                    onChange={handlePreferenceSelect("contentFilter")}
                  >
                    <option value="balanced">Balanced</option>
                    <option value="strict">Strict</option>
                    <option value="open">Open</option>
                  </select>
                </label>
              </div>

              <div className="settings-action-row">
                <button
                  type="button"
                  className="settings-primary-btn"
                  disabled={!preferenceChanged || savingPreferences}
                  onClick={handleSavePreferences}
                >
                  <FaBookmark />
                  {savingPreferences ? "Saving..." : "Save preferences"}
                </button>
                <button
                  type="button"
                  className="settings-secondary-btn"
                  onClick={handleResetPreferences}
                >
                  Reset defaults
                </button>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <span className="settings-card-kicker">
                    <IoMdSettings /> Quick actions
                  </span>
                  <h2>Useful account shortcuts</h2>
                </div>
                <p>Jump to the areas you are most likely to use next.</p>
              </div>

              <div className="settings-link-list">
                <Link to={`/profile/${user.username}`} className="settings-inline-link">
                  View public profile <FaArrowRight />
                </Link>
                <Link to="/create" className="settings-inline-link">
                  Write a new article <FaArrowRight />
                </Link>
                <Link to="/explore" className="settings-inline-link">
                  Explore the community <FaArrowRight />
                </Link>
              </div>

              <button
                type="button"
                className="settings-danger-btn"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Log out
              </button>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Setting;
