import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import './TopToolbar.css'

const NAV_LINKS = [
    { to: "/", label: "Home" },
    { to: "/skills", label: "Skills" },
    { to: "/projects", label: "Projects" },
    { to: "/about", label: "About" },
    { to: "/designs", label: "Designs" },
    { to: "/certificates", label: "Certificates" },
];

function TopToolbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const handlePointerDown = (event) => {
      if (!event.target.closest(".site-header")) setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
      <header className="site-header">
          <div className="container header-inner">
              <Link to="/" className="brand" aria-label="Randall Krouth, home">
                  <span className="brand-mark" aria-hidden="true">RK</span>
                  <span className="brand-name">
                      Randall Krouth
                      <small>Full-Stack Developer &amp; ML Engineer</small>
                  </span>
              </Link>

              <nav
                  id="primary-navigation"
                  className={`main-nav${menuOpen ? " is-open" : ""}`}
                  aria-label="Primary"
              >
                  {NAV_LINKS.map((link) => (
                      <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.to === "/"}
                          className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                          onClick={() => setMenuOpen(false)}
                      >
                          {link.label}
                      </NavLink>
                  ))}
                  <NavLink
                      to="/contact"
                      className={({ isActive }) => `nav-link nav-link--mobile${isActive ? " is-active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                  >
                      Contact
                  </NavLink>
              </nav>

              <Link to="/contact" className="btn btn-primary header-cta">
                  Let&apos;s talk
              </Link>

              <button
                  type="button"
                  className={`menu-toggle${menuOpen ? " is-open" : ""}`}
                  aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                  aria-expanded={menuOpen}
                  aria-controls="primary-navigation"
                  onClick={() => setMenuOpen((open) => !open)}
              >
                  <span className="menu-toggle-icon" aria-hidden="true">
                      <span />
                      <span />
                  </span>
              </button>
          </div>
      </header>
  );
}

export default TopToolbar;