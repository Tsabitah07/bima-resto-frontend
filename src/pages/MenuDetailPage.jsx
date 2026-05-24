import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMenu, getImageUrl } from '../api';
import Navbar from '../components/Navbar';

export default function MenuDetailPage() {
    const { id } = useParams();
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        getMenu(id)
            .then((res) => setMenu(res.data?.data || res.data))
            .catch(() => setError('Failed to load menu details.'))
            .finally(() => setLoading(false));
    }, [id]);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (loading) {
        return (
            <div className="page">
                <Navbar />
                <div className="loading-screen">
                    <div className="loading-spinner" />
                    <p>Loading menu…</p>
                </div>
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="page">
                <Navbar />
                <div className="section">
                    <div className="section-inner">
                        <div className="alert alert-error">{error || 'Menu not found.'}</div>
                        <Link to="/dashboard" className="btn-outline" style={{ marginTop: 20, display: 'inline-block' }}>← Back to Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    const posters = menu.posters || [];
    const isMenuExpired = (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(menu.end_date);
        end.setHours(23, 59, 59, 999);
        return end < today;
    })();

    return (
        <div className="page">
            <Navbar />

            <section className="section menu-detail-section">
                <div className="section-inner">
                    <Link to="/dashboard" className="menu-detail-back">← Back to Menu</Link>

                    <div className="menu-detail-grid">
                        {/* Poster gallery */}
                        <div className="menu-detail-gallery">
                            {posters.length > 0 ? (
                                <>
                                    <div className="menu-detail-main-img">
                                        <img
                                            src={getImageUrl(posters[activeImg])}
                                            alt={menu.name}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                    {posters.length > 1 && (
                                        <div className="menu-detail-thumbs">
                                            {posters.map((p, i) => (
                                                <button
                                                    key={i}
                                                    className={`menu-detail-thumb${i === activeImg ? ' active' : ''}`}
                                                    onClick={() => setActiveImg(i)}
                                                >
                                                    <img src={getImageUrl(p)} alt={`poster ${i + 1}`} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="menu-detail-no-img">🍽</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="menu-detail-info">
                            <div className="section-label">Menu Details</div>
                            <h1 className="menu-detail-title">{menu.name}</h1>
                            <p className="menu-detail-dates">
                                📅 {formatDate(menu.start_date)} – {formatDate(menu.end_date)}
                            </p>

                            {menu.description && (
                                <p className="menu-detail-desc">{menu.description}</p>
                            )}

                            {menu.food_packages && menu.food_packages.length > 0 && (
                                <div className="menu-detail-packages">
                                    <h3>Food Packages</h3>
                                    <div className="menu-detail-pkg-list">
                                        {menu.food_packages.map((fp) => (
                                            <div key={fp.id} className="menu-detail-pkg-card">
                                                <div className="menu-detail-pkg-name">{fp.name}</div>
                                                {fp.price && (
                                                    <div className="menu-detail-pkg-price">
                                                        Rp {Number(fp.price).toLocaleString('id-ID')}
                                                    </div>
                                                )}
                                                {fp.description && (
                                                    <div className="menu-detail-pkg-desc">{fp.description}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 32 }}>
                                {isMenuExpired ? (
                                    <div className="alert alert-error" style={{ display: 'inline-block' }}>
                                        ⛔ Menu ini sudah tidak tersedia untuk booking
                                    </div>
                                ) : (
                                    <Link to="/booking" className="btn-primary">Book a Table</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
