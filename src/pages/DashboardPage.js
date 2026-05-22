import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMenus, getImageUrl } from '../api';
import Navbar from '../components/Navbar';

function MenuCard({ menu }) {
  const poster = menu.posters && menu.posters.length > 0
    ? getImageUrl(menu.posters[0])
    : null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="menu-card">
      <div className="menu-card-img">
        {poster ? (
          <img src={poster} alt={menu.name} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="menu-no-img">🍜</div>
        )}
      </div>
      <div className="menu-card-body">
        <h3>{menu.name}</h3>
        <p className="menu-dates">
          {formatDate(menu.start_date)} – {formatDate(menu.end_date)}
        </p>
        {menu.food_packages && menu.food_packages.length > 0 && (
          <div className="menu-packages">
            <span className="pkg-label">Packages:</span>
            <div className="pkg-list">
              {menu.food_packages.slice(0, 3).map((fp) => (
                <span key={fp.id} className="pkg-tag">{fp.name}</span>
              ))}
              {menu.food_packages.length > 3 && (
                <span className="pkg-tag muted">+{menu.food_packages.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMenus()
      .then((res) => setMenus(res.data?.data || []))
      .catch(() => setError('Failed to load menus.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">✦ Fine Dining Experience</span>
          <h1 className="hero-title">Welcome to<br /><em>BimaResto</em></h1>
          <p className="hero-subtitle">
            A culinary journey through flavors crafted with passion and the finest local ingredients.
            Reserve your table and experience something extraordinary.
          </p>
          <div className="hero-cta">
            <Link to="/booking" className="btn-primary">Book a Table</Link>
            <a href="#menus" className="btn-outline">View Menu</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-plate">🍽</div>
        </div>
      </section>

      {/* About */}
      <section className="section about-section" id="about">
        <div className="section-inner">
          <div className="section-label">About Us</div>
          <h2 className="section-title">The Story Behind BimaResto</h2>
          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon">🌿</div>
              <h3>Fresh Ingredients</h3>
              <p>We source our ingredients daily from local farms and trusted suppliers to guarantee the freshest dishes on your plate.</p>
            </div>
            <div className="about-card">
              <div className="about-icon">👨‍🍳</div>
              <h3>Expert Chefs</h3>
              <p>Our culinary team brings decades of combined experience, blending traditional Indonesian flavors with modern techniques.</p>
            </div>
            <div className="about-card">
              <div className="about-icon">🏛</div>
              <h3>Warm Ambience</h3>
              <p>Designed for comfort and intimacy, our space is perfect for family gatherings, romantic dinners, and corporate events.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menus */}
      <section className="section menus-section" id="menus">
        <div className="section-inner">
          <div className="section-label">Our Menu</div>
          <h2 className="section-title">Current Offerings</h2>

          {loading && (
            <div className="loading-box">
              <div className="loading-spinner" />
              <p>Loading menus…</p>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && menus.length === 0 && !error && (
            <div className="empty-state">
              <span>🍽</span>
              <p>No menus available at the moment. Check back soon!</p>
            </div>
          )}

          <div className="menus-grid">
            {menus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>

          {menus.length > 0 && (
            <div className="section-cta">
              <Link to="/booking" className="btn-primary">Reserve Your Table</Link>
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="section contact-section" id="contact">
        <div className="section-inner">
          <div className="section-label">Contact</div>
          <h2 className="section-title">Find Us</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <h4>Address</h4>
                <p>Jl. Kuliner Raya No. 12<br />Jakarta Selatan, 12430</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <h4>Phone</h4>
                <p>+62 21 1234 5678</p>
                <p>+62 812 3456 7890</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🕐</div>
              <div>
                <h4>Opening Hours</h4>
                <p>Mon – Fri: 11:00 – 22:00</p>
                <p>Sat – Sun: 10:00 – 23:00</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div>
                <h4>Email</h4>
                <p>info@bimaresto.id</p>
                <p>booking@bimaresto.id</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 BimaResto. All rights reserved.</p>
      </footer>
    </div>
  );
}
