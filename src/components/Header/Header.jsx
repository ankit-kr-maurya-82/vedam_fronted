import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import UserContext from "../../context/UserContext";
import "./header.css";
import { searchContent } from "../../api/search";

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });

  const searchRef = useRef(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const normalized = query.trim();
    if (!normalized) {
      setResults({ users: [], posts: [] });
      return;
    }

    const loadResults = async () => {
      const nextResults = await searchContent(normalized);
      if (!cancelled) {
        setResults(nextResults);
      }
    };

    loadResults();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const submitSearch = () => {
    const normalized = query.trim();
    if (!normalized) return;
    navigate(`/explore?q=${encodeURIComponent(normalized)}`);
    setSearchOpen(false);
  };

  return (
    <header className="headerWrapper">
      <div className={`header ${searchOpen ? "search-active" : ""}`}>

        {/* Hamburger */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Search */}
        <div
          ref={searchRef}
          className={`searchBox ${searchOpen ? "open" : ""}`}
          onClick={() => !searchOpen && setSearchOpen(true)}
        >
          <FaSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Search..."
            className="searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
          />
          {searchOpen && query.trim() && (
            <div className="searchDropdown">
              {results.users.length === 0 && results.posts.length === 0 ? (
                <button className="searchResultItem static" onClick={submitSearch}>
                  Search for "{query}"
                </button>
              ) : (
                <>
                  {results.users.slice(0, 3).map((resultUser) => (
                    <button
                      key={resultUser.id}
                      className="searchResultItem"
                      onClick={() => {
                        navigate(`/profile/${resultUser.username}`);
                        setSearchOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="searchType">User</span>
                      <strong>{resultUser.fullName || resultUser.username}</strong>
                      <span>@{resultUser.username}</span>
                    </button>
                  ))}

                  {results.posts.slice(0, 3).map((post) => (
                    <button
                      key={post.id || post._id}
                      className="searchResultItem"
                      onClick={() => {
                        navigate(`/post/${post.id || post._id}`);
                        setSearchOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="searchType">Article</span>
                      <strong>{post.title}</strong>
                      <span>@{post.username}</span>
                    </button>
                  ))}

                  <button className="searchResultItem static" onClick={submitSearch}>
                    View all results
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="navLinks hideOnSearch">
          <NavLink to={user ? "/home" : "/"}>Home</NavLink>
          <NavLink to="/explore">Explore</NavLink>
          {user && <NavLink to="/create">Create</NavLink>}
          <NavLink to="/about">About</NavLink>
          <NavLink to="/features">Features</NavLink>
          {user && <NavLink to={`/profile/${user.username}`}>Profile</NavLink>}
        </nav>

        {/* Right Side */}
        <div className="headerActions hideOnSearch">
          {user ? (
            <>
              <NavLink to={`/profile/${user.username}`} className="headerUserChip">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="headerAvatar" />
                ) : (
                  <div className="headerAvatar headerAvatarFallback">
                    {(user.fullName || user.username)?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="headerUserName">@{user.username}</span>
              </NavLink>
              <NavLink to="/"><button className="btn" onClick={logout} >Logout</button></NavLink>
            </>
          ) : (
            <NavLink to="/login" className="btn">Login</NavLink>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobileMenu ${menuOpen ? "open" : ""}`}>
        <NavLink to={user ? "/home" : "/"} onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/explore" onClick={() => setMenuOpen(false)}>Explore</NavLink>
        {user && (
          <NavLink to="/create" onClick={() => setMenuOpen(false)}>
            Create
          </NavLink>
        )}
        {user && (
          <NavLink to={`/profile/${user.username}`} onClick={() => setMenuOpen(false)}>
            Profile
          </NavLink>
        )}

        {user ? (
          <button onClick={() => { logout(); setMenuOpen(false); }}>
            Logout
          </button>
        ) : (
          <NavLink to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
