import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMenus, getImageUrl } from '../api';
import Navbar from '../components/Navbar';
import carouselImages from '../CarouselImages';

/* ─────────────────────────────────────────────────────────────
   HERO CAROUSEL — reads from public/images/ via carouselImages.js
   ───────────────────────────────────────────────────────────── */
function HeroCarousel() {
    const slides = carouselImages.map(
        (filename) => `${process.env.PUBLIC_URL}/assets/${filename}`
    );

    const [current, setCurrent] = useState(0);
    const [loaded, setLoaded] = useState({});

    const prev = useCallback(() =>
        setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);
    const next = useCallback(() =>
        setCurrent((c) => (c + 1) % slides.length), [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [next, slides.length]);

    return (
        <section className="hero-carousel">
            {/* Background slides from public/images */}
            {slides.length > 0 ? (
                slides.map((src, i) => (
                    <div
                        key={i}
                        className={`hero-slide${i === current ? ' active' : ''}`}
                        aria-hidden={i !== current}
                    >
                        <img
                            src={src}
                            alt={`Carousel ${i + 1}`}
                            onLoad={() => setLoaded((p) => ({ ...p, [i]: true }))}
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{ opacity: loaded[i] ? 1 : 0, transition: 'opacity 0.4s' }}
                        />
                    </div>
                ))
            ) : (
                /* Fallback gradient when carouselImages is empty */
                <div className="hero-slide active hero-slide-fallback" />
            )}

            {/* Always-dark overlay → text always readable */}
            <div className="hero-overlay" />

            {/* Hero text */}
            <div className="hero-content-wrap">
                <div className="hero-content">
                    <span className="hero-badge">✦ Fine Dining Experience</span>
                    <h1 className="hero-title">Welcome to<br /><em>BimaResto</em></h1>
                    <p className="hero-subtitle">
                        A culinary journey through flavors crafted with passion and the finest local ingredients.
                        Reserve your table and experience something extraordinary.
                    </p>
                    <div className="hero-cta">
                        <Link to="/booking" className="btn-primary">Book a Table</Link>
                        <a href="#menus" className="btn-outline-light">View Menu</a>
                    </div>
                </div>
            </div>

            {slides.length > 1 && (
                <>
                    <button className="carousel-btn carousel-prev" onClick={prev} aria-label="Previous">&#8249;</button>
                    <button className="carousel-btn carousel-next" onClick={next} aria-label="Next">&#8250;</button>
                    <div className="carousel-dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`carousel-dot${i === current ? ' active' : ''}`}
                                onClick={() => setCurrent(i)}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────
   MENU POSTER GALLERY — all menus from API
   ───────────────────────────────────────────────────────────── */
function MenuPosterGallery({ menus, loading }) {
    const menusWithPosters = menus.filter((m) => m.posters?.length > 0);

    if (loading) return (
        <div className="loading-box"><div className="loading-spinner" /><p>Loading posters…</p></div>
    );
    if (menusWithPosters.length === 0) return null;

    return (
        <section className="section poster-gallery-section" id="posters">
            <div className="section-inner">
                <div className="section-label">Our Menus</div>
                <h2 className="section-title">Menu Posters</h2>
                <div className="poster-gallery-grid">
                    {menusWithPosters.map((menu) => (
                        <Link to={`/menu/${menu.id}`} key={menu.id} className="poster-card">
                            <div className="poster-card-img">
                                <img
                                    src={getImageUrl(menu.posters[0])}
                                    alt={menu.name}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                {/* Show count badge if multiple posters */}
                                {menu.posters.length > 1 && (
                                    <span className="poster-count-badge">+{menu.posters.length - 1} foto</span>
                                )}
                            </div>
                            <div className="poster-card-label">{menu.name}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────
   AVAILABLE FOOD PACKAGES — menus where today is within range
   ───────────────────────────────────────────────────────────── */
function isMenuActiveToday(menu) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(menu.start_date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(menu.end_date);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

function AvailablePackages({ menus, loading, error }) {
    const activeMenus = menus.filter(isMenuActiveToday);
    // Collect all packages from active menus
    const allPackages = activeMenus.flatMap((menu) =>
        (menu.food_packages || []).map((fp) => ({ ...fp, menuName: menu.name, menu }))
    );

    return (
        <section className="section packages-section" id="menus">
            <div className="section-inner">
                <div className="section-label">Tersedia Hari Ini</div>
                <h2 className="section-title">Food Packages</h2>

                {loading && (
                    <div className="loading-box"><div className="loading-spinner" /><p>Memuat paket makanan…</p></div>
                )}
                {error && <div className="alert alert-error">{error}</div>}

                {!loading && activeMenus.length === 0 && !error && (
                    <div className="empty-state">
                        <span>🍽</span>
                        <p>Tidak ada menu yang aktif hari ini. Nantikan promo kami berikutnya!</p>
                    </div>
                )}

                {!loading && activeMenus.length > 0 && allPackages.length === 0 && (
                    <div className="empty-state">
                        <span>📦</span>
                        <p>Menu aktif tersedia, tapi belum ada food package yang ditambahkan.</p>
                    </div>
                )}

                {activeMenus.length > 0 && allPackages.length > 0 && (
                    <>
                        {/* Group by menu */}
                        {activeMenus.map((menu) => {
                            const pkgs = menu.food_packages || [];
                            if (pkgs.length === 0) return null;
                            return (
                                <div key={menu.id} className="pkg-group">
                                    <div className="pkg-group-header">
                                        <h3 className="pkg-group-title">
                                            <Link to={`/menu/${menu.id}`} className="pkg-group-link">
                                                {menu.name}
                                            </Link>
                                        </h3>
                                        <span className="pkg-group-dates">
                      {formatDate(menu.start_date)} – {formatDate(menu.end_date)}
                    </span>
                                        <span className="pkg-active-badge">● Aktif</span>
                                    </div>
                                    <div className="pkg-cards-grid">
                                        {pkgs.map((fp) => (
                                            <div key={fp.id} className="pkg-available-card">
                                                <div className="pkg-available-icon">🍱</div>
                                                <div className="pkg-available-info">
                                                    <div className="pkg-available-name">{fp.name}</div>
                                                    {fp.price && (
                                                        <div className="pkg-available-price">
                                                            Rp {Number(fp.price).toLocaleString('id-ID')}
                                                        </div>
                                                    )}
                                                    {fp.description && (
                                                        <div className="pkg-available-desc">{fp.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="section-cta">
                            <Link to="/booking" className="btn-primary">Pesan Sekarang</Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────
   MENU CARD (unchanged, used below about section)
   ───────────────────────────────────────────────────────────── */
// (removed old MenuCard — replaced by poster gallery + packages sections)

/* ─────────────────────────────────────────────────────────────
   DASHBOARD PAGE
   ───────────────────────────────────────────────────────────── */
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

            {/* 1. Hero dengan carousel dari public/images */}
            <HeroCarousel />

            {/* 2. About */}
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

            {/* 3. Semua poster menu dari API */}
            <MenuPosterGallery menus={menus} loading={loading} />

            {/* 4. Food packages yang available hari ini */}
            <AvailablePackages menus={menus} loading={loading} error={error} />

            {/* 5. Contact */}
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
