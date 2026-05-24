import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMenus,
    getBookingSessions,
    getFoodPackagesByMenu,
    getFoodPackagesBySession,
    createBooking,
    getBookingsByUser,
    updateBooking,
} from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function BookingCard({ booking, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const statusColor = {
        pending: '#f59e0b',
        confirmed: '#10b981',
        cancelled: '#ef4444',
        completed: '#6366f1',
    };

    const handleDelete = async () => {
        if (!window.confirm('Cancel this booking?')) return;
        setDeleting(true);
        try { await onDelete(booking.id); }
        finally { setDeleting(false); }
    };

    return (
        <div className="booking-card">
            <div className="booking-card-header">
                <span className="booking-id">Booking #{booking.id}</span>
                <span
                    className="booking-status"
                    style={{ background: statusColor[booking.booking_status] || '#94a3b8' }}
                >
          {booking.booking_status}
        </span>
            </div>
            <div className="booking-card-body">
                <div className="booking-detail">
                    <span>📅</span>
                    <span>{new Date(booking.booking_date).toLocaleDateString('id-ID', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}</span>
                </div>
                <div className="booking-detail">
                    <span>👥</span>
                    <span>{booking.number_of_people} people</span>
                </div>
                {booking.notes && (
                    <div className="booking-detail">
                        <span>📝</span>
                        <span>{booking.notes}</span>
                    </div>
                )}
                {booking.booked_foods && booking.booked_foods.length > 0 && (
                    <div className="booking-foods">
                        <p className="foods-label">Ordered:</p>
                        {booking.booked_foods.map((f, i) => (
                            <div key={i} className="food-item-row">
                                <span>{f.food_package_name}</span>
                                <span className="food-qty">×{f.quantity}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {booking.booking_status === 'pending' && (
                <div className="booking-card-footer">
                    <button
                        className="btn-danger small"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? 'Cancelling…' : 'Cancel Booking'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function BookingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [menus, setMenus] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [foodPackages, setFoodPackages] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [tab, setTab] = useState('new'); // 'new' | 'history'

    const [form, setForm] = useState({
        menu_id: '',
        booking_session_id: '',
        booking_date: '',
        number_of_people: 1,
        notes: '',
        booked_foods: [],
    });

    const [loading, setLoading] = useState(false);
    const [loadingFoods, setLoadingFoods] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        getMenus().then((r) => {
            const allMenus = r.data?.data || [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const activeMenus = allMenus.filter((m) => {
                const end = new Date(m.end_date);
                end.setHours(23, 59, 59, 999);
                return end >= today;
            });
            setMenus(activeMenus);
        });
        getBookingSessions().then((r) => setSessions(r.data?.data || []));
        if (user?.id) {
            getBookingsByUser(user.id).then((r) => setMyBookings(r.data?.data || []));
        }
    }, [user]);

    // Load food packages when menu or session changes
    useEffect(() => {
        if (form.menu_id && form.booking_session_id) {
            setLoadingFoods(true);
            getFoodPackagesByMenu(form.menu_id)
                .then((r) => {
                    const all = r.data?.data || [];
                    const filtered = all.filter(
                        (fp) => String(fp.session_id) === String(form.booking_session_id)
                    );
                    setFoodPackages(filtered);
                })
                .catch(() => setFoodPackages([]))
                .finally(() => setLoadingFoods(false));
            // Reset food selections when menu/session changes
            setForm((f) => ({ ...f, booked_foods: [] }));
        } else {
            setFoodPackages([]);
        }
    }, [form.menu_id, form.booking_session_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleFoodQty = (foodId, qty) => {
        setForm((f) => {
            const existing = f.booked_foods.find((bf) => bf.food_id === foodId);
            if (qty <= 0) {
                return { ...f, booked_foods: f.booked_foods.filter((bf) => bf.food_id !== foodId) };
            }
            if (existing) {
                return {
                    ...f,
                    booked_foods: f.booked_foods.map((bf) =>
                        bf.food_id === foodId ? { ...bf, quantity: qty } : bf
                    ),
                };
            }
            return { ...f, booked_foods: [...f.booked_foods, { food_id: foodId, quantity: qty }] };
        });
    };

    const getFoodQty = (foodId) =>
        form.booked_foods.find((bf) => bf.food_id === foodId)?.quantity || 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.menu_id || !form.booking_session_id || !form.booking_date) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_id: user.id,
                booking_status: 'pending',
                booking_date: new Date(form.booking_date).toISOString(),
                booking_session_id: parseInt(form.booking_session_id),
                number_of_people: parseInt(form.number_of_people),
                notes: form.notes || null,
                booked_foods: form.booked_foods,
            };

            await createBooking(payload);
            setSuccess('Booking created successfully!');
            setForm({
                menu_id: '',
                booking_session_id: '',
                booking_date: '',
                number_of_people: 1,
                notes: '',
                booked_foods: [],
            });

            // Refresh bookings list
            const r = await getBookingsByUser(user.id);
            setMyBookings(r.data?.data || []);
            setTab('history');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create booking.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        await updateBooking(id, { booking_status: 'cancelled' });
        setMyBookings((prev) =>
            prev.map((b) => b.id === id ? { ...b, booking_status: 'cancelled' } : b)
        );
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="page">
            <Navbar />

            <div className="page-hero small">
                <h1>Table Reservation</h1>
                <p>Book your dining experience at BimaResto</p>
            </div>

            <div className="booking-container">
                <div className="booking-tabs">
                    <button
                        className={`booking-tab ${tab === 'new' ? 'active' : ''}`}
                        onClick={() => setTab('new')}
                    >
                        ✦ New Booking
                    </button>
                    <button
                        className={`booking-tab ${tab === 'history' ? 'active' : ''}`}
                        onClick={() => setTab('history')}
                    >
                        My Reservations
                        {myBookings.length > 0 && (
                            <span className="tab-badge">{myBookings.length}</span>
                        )}
                    </button>
                </div>

                {tab === 'new' && (
                    <div className="booking-form-wrap">
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form onSubmit={handleSubmit} className="booking-form">
                            <div className="form-section">
                                <h3 className="form-section-title">📋 Booking Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Select Menu *</label>
                                        <select name="menu_id" value={form.menu_id} onChange={handleChange} required>
                                            <option value="">— Choose a menu —</option>
                                            {menus.map((m) => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Session *</label>
                                        <select
                                            name="booking_session_id"
                                            value={form.booking_session_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">— Choose a session —</option>
                                            {sessions.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name} – {s.time}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date *</label>
                                        <input
                                            type="date"
                                            name="booking_date"
                                            value={form.booking_date}
                                            onChange={handleChange}
                                            min={today}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Number of Guests *</label>
                                        <input
                                            type="number"
                                            name="number_of_people"
                                            value={form.number_of_people}
                                            onChange={handleChange}
                                            min={1}
                                            max={50}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Special Notes</label>
                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        placeholder="Any dietary restrictions, special requests, or occasion details…"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {form.menu_id && form.booking_session_id && (
                                <div className="form-section">
                                    <h3 className="form-section-title">🍜 Select Food Packages</h3>
                                    {loadingFoods ? (
                                        <div className="loading-box small">
                                            <div className="loading-spinner small" /> Loading packages…
                                        </div>
                                    ) : foodPackages.length === 0 ? (
                                        <p className="muted-text">No food packages available for this menu + session combination.</p>
                                    ) : (
                                        <div className="food-packages-grid">
                                            {foodPackages.map((fp) => {
                                                const qty = getFoodQty(fp.id);
                                                return (
                                                    <div key={fp.id} className={`food-package-card ${qty > 0 ? 'selected' : ''}`}>
                                                        <div className="fp-icon">🍱</div>
                                                        <div className="fp-info">
                                                            <h4>{fp.name}</h4>
                                                            <p>{fp.description}</p>
                                                            <p className="fp-avail">Available: {fp.available_quantity}</p>
                                                        </div>
                                                        <div className="fp-qty-control">
                                                            <button
                                                                type="button"
                                                                className="qty-btn"
                                                                onClick={() => handleFoodQty(fp.id, qty - 1)}
                                                                disabled={qty === 0}
                                                            >−</button>
                                                            <span className="qty-display">{qty}</span>
                                                            <button
                                                                type="button"
                                                                className="qty-btn"
                                                                onClick={() => handleFoodQty(fp.id, qty + 1)}
                                                                disabled={qty >= fp.available_quantity}
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-submit">
                                <button type="submit" className="btn-primary large" disabled={loading}>
                                    {loading ? <><span className="spinner-small" /> Processing…</> : '✦ Confirm Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {tab === 'history' && (
                    <div className="bookings-history">
                        {myBookings.length === 0 ? (
                            <div className="empty-state">
                                <span>📋</span>
                                <p>No reservations yet. Make your first booking!</p>
                                <button className="btn-primary" onClick={() => setTab('new')}>Book Now</button>
                            </div>
                        ) : (
                            <div className="bookings-grid">
                                {myBookings.map((b) => (
                                    <BookingCard key={b.id} booking={b} onDelete={handleDelete} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
