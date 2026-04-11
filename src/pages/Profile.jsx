import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserContext from "../context/UserContext";
import Card from "../components/Card";
import FollowBtn from "../components/FollowBtn";
import "./CSS/Profile.css";
import "./CSS/Profile_part2.css";
import EditProfile from "../components/EditProfile";
import { fetchProfileBundle, toggleFollowProfile } from "../api/profile";
import { syncUserToStore } from "../lib/socialStore";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [relationshipView, setRelationshipView] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      const bundle = await fetchProfileBundle(username);
      if (!cancelled) {
        setProfileUser(bundle.user || user || null);
        setPosts(bundle.posts || []);
        setLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [username, user]);

  const isOwnProfile = useMemo(
    () => user?.id && profileUser?.id && user.id === profileUser.id,
    [user, profileUser]
  );

  const handleFollowToggle = async () => {
    if (!user || !profileUser?.username || followLoading) {
      return;
    }

    setFollowLoading(true);

    const wasFollowing = Boolean(profileUser.isFollowing);
    const previousFollowers = profileUser.followers || 0;
    const optimisticProfile = syncUserToStore({
      ...profileUser,
      isFollowing: !wasFollowing,
      followers: Math.max(
        0,
        previousFollowers + (wasFollowing ? -1 : 1)
      ),
    });

    setProfileUser(optimisticProfile);
    setRelationshipView("followers");

    try {
      const result = await toggleFollowProfile(profileUser.username);
      setProfileUser(result.profile);
      if (result.currentUser) {
        setUser(result.currentUser);
      }
    } catch (error) {
      setProfileUser(
        syncUserToStore({
          ...profileUser,
          isFollowing: wasFollowing,
          followers: previousFollowers,
        })
      );
      window.alert(
        error.response?.data?.message || error.message || "Unable to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    setProfileUser(syncUserToStore(updatedUser));
    if (updatedUser?.username && updatedUser.username !== username) {
      navigate(`/profile/${updatedUser.username}`, { replace: true });
    }
  };

  if (loading) {
    return <div className="profile-login-warning">Loading profile...</div>;
  }

  if (!profileUser) {
    return <div className="profile-login-warning">User profile not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <section className="profile-hero-card">
          <div className="profile-hero-backdrop" aria-hidden="true">
            <span className="profile-orb profile-orb-one" />
            <span className="profile-orb profile-orb-two" />
            <span className="profile-grid" />
          </div>

          <div className="profile-hero-topline">
            <span className="profile-kicker">Writer profile</span>
            <span className="profile-issue-note">Personal essays, notes, and published articles</span>
          </div>

          <div className="profile-top">
            <div className="avatar-wrapper">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt="avatar"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar fallback-avatar">
                  {profileUser.username?.charAt(0).toUpperCase()}
                </div>
              )}

              {isOwnProfile && (
                <button
                  className="avatar-overlay edit-profile-btn"
                  onClick={() => setEditOpen(true)}
                >
                  Edit Profile
                </button>
              )}

              {editOpen && (
                <EditProfile
                  onClose={() => setEditOpen(false)}
                  onProfileUpdated={handleProfileUpdated}
                />
              )}
            </div>

            <div className="profile-info">
              <div className="profile-heading-row">
                <div className="profile-heading-copy">
                  <div className="profile-badge-row">
                    <span className="profile-mini-badge">Featured voice</span>
                    <span className="profile-mini-badge subtle">
                      {isOwnProfile ? "Your public page" : "Open profile"}
                    </span>
                  </div>
                  <h1 className="fullName">
                    {profileUser.fullName || profileUser.username}
                  </h1>
                  <p className="profile-username">@{profileUser.username}</p>
                </div>

                {!isOwnProfile && user && (
                  <FollowBtn
                    isFollowing={Boolean(profileUser.isFollowing)}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  />
                )}
              </div>

              <p className="profile-bio">
                {profileUser.bio || "No bio added yet."}
              </p>

              <div className="profile-intro-grid">
                <article className="profile-note-card">
                  <span className="profile-note-label">Profile note</span>
                  <p>
                    {isOwnProfile
                      ? "This is your editorial home for essays, updates, and conversations with readers."
                      : `${profileUser.fullName || profileUser.username} shares essays, observations, and thoughtful pieces with this audience.`}
                  </p>
                </article>

                <article className="profile-highlight-card">
                  <span className="profile-note-label">At a glance</span>
                  <ul className="profile-highlight-list">
                    <li>{posts.length} published article{posts.length === 1 ? "" : "s"}</li>
                    <li>{profileUser.followers || 0} reader follower{profileUser.followers === 1 ? "" : "s"}</li>
                    <li>{profileUser.following || 0} profile connection{profileUser.following === 1 ? "" : "s"}</li>
                  </ul>
                </article>
              </div>

              <div className="profile-stats">
                <button
                  type="button"
                  className={`profile-stat-card ${relationshipView === "followers" ? "active" : ""}`}
                  onClick={() =>
                    setRelationshipView((current) =>
                      current === "followers" ? null : "followers"
                    )
                  }
                >
                  <b>{profileUser.followers || 0}</b>
                  <span>Followers</span>
                </button>
                <button
                  type="button"
                  className={`profile-stat-card ${relationshipView === "following" ? "active" : ""}`}
                  onClick={() =>
                    setRelationshipView((current) =>
                      current === "following" ? null : "following"
                    )
                  }
                >
                  <b>{profileUser.following || 0}</b>
                  <span>Following</span>
                </button>
                <article className="profile-stat-card static">
                  <b>{posts.length}</b>
                  <span>Articles</span>
                </article>
              </div>

              {relationshipView && (
                <div className="profile-relationships">
                  <section className="profile-relationship-card">
                    <div className="profile-relationship-toolbar">
                      <div className="profile-relationship-head">
                        <h3>{relationshipView === "followers" ? "Followers" : "Following"}</h3>
                        <span>
                          {relationshipView === "followers"
                            ? profileUser.followers || 0
                            : profileUser.following || 0}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="profile-relationship-close"
                        onClick={() => setRelationshipView(null)}
                      >
                        Close
                      </button>
                    </div>

                    {relationshipView === "followers" ? (
                      profileUser.followerList?.length ? (
                        <div className="profile-relationship-list">
                          {profileUser.followerList.map((person) => (
                            <Link
                              key={person.id || person._id}
                              to={`/profile/${person.username}`}
                              className="profile-person-row"
                            >
                              {person.avatar ? (
                                <img
                                  src={person.avatar}
                                  alt={person.username}
                                  className="profile-person-avatar"
                                />
                              ) : (
                                <div className="profile-person-avatar fallback-avatar">
                                  {person.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <strong>{person.fullName || person.username}</strong>
                                <span>@{person.username}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="profile-relationship-empty">Abhi tak koi follower nahi hai.</p>
                      )
                    ) : profileUser.followingList?.length ? (
                      <div className="profile-relationship-list">
                        {profileUser.followingList.map((person) => (
                          <Link
                            key={person.id || person._id}
                            to={`/profile/${person.username}`}
                            className="profile-person-row"
                          >
                            {person.avatar ? (
                              <img
                                src={person.avatar}
                                alt={person.username}
                                className="profile-person-avatar"
                              />
                            ) : (
                              <div className="profile-person-avatar fallback-avatar">
                                {person.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <strong>{person.fullName || person.username}</strong>
                              <span>@{person.username}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="profile-relationship-empty">Ye user abhi kisi ko follow nahi karta.</p>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="profile-tabs">
          {["posts", "replies", "media"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "posts" ? "Articles" : tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "posts" && (
          <section className="profile-posts">
            <div className="profile-section-head">
              <div>
                <span className="profile-kicker">Published work</span>
                <h2>Articles by {profileUser.fullName || profileUser.username}</h2>
              </div>
              <p>
                A curated archive of essays, observations, and ideas from this
                profile.
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="profile-empty-card">
                <h3>No articles yet</h3>
                <p>
                  {isOwnProfile
                    ? "Publish your first article to start building your reading feed."
                    : "This writer has not published any articles yet."}
                </p>
              </div>
            ) : (
              <div className="profile-posts-shell">
                <Card posts={posts} />
              </div>
            )}
          </section>
        )}

        {activeTab !== "posts" && (
          <div className="empty-state">Coming soon</div>
        )}
      </div>
    </div>
  );
};

export default Profile;
