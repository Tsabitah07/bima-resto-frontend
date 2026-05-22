import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUser, changePassword } from '../api';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('info');

  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  const [pwForm, setPwForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);

  const handleInfoChange = (e) =>
    setInfoForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePwChange = (e) =>
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoMsg({ type: '', text: '' });
    setLoadingInfo(true);
    try {
      await updateUser(user.id, infoForm);
      await refreshUser();
      setInfoMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setInfoMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Update failed.',
      });
    } finally {
      setLoadingInfo(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoadingPw(true);
    try {
      await changePassword(user.id, pwForm);
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to change password.',
      });
    } finally {
      setLoadingPw(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="page">
      <Navbar />

      <div className="page-hero small">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-container">
        {/* Avatar card */}
        <div className="profile-avatar-card">
          <div className="avatar-circle">{initials}</div>
          <h2>{user?.name}</h2>
          <p className="profile-username">@{user?.username}</p>
          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Phone</span>
              <span>{user?.phone_number}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Role</span>
              <span className="role-badge">{user?.role?.name || `Role #${user?.role_id}`}</span>
            </div>
          </div>
        </div>

        {/* Edit forms */}
        <div className="profile-forms">
          <div className="profile-tabs">
            <button
              className={`profile-tab ${tab === 'info' ? 'active' : ''}`}
              onClick={() => setTab('info')}
            >
              Edit Profile
            </button>
            <button
              className={`profile-tab ${tab === 'password' ? 'active' : ''}`}
              onClick={() => setTab('password')}
            >
              Change Password
            </button>
          </div>

          {tab === 'info' && (
            <form onSubmit={handleInfoSubmit} className="profile-form">
              {infoMsg.text && (
                <div className={`alert alert-${infoMsg.type}`}>{infoMsg.text}</div>
              )}
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={infoForm.name}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={infoForm.username}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={infoForm.email}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={infoForm.phone_number}
                  onChange={handleInfoChange}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loadingInfo}>
                {loadingInfo ? <span className="spinner-small" /> : 'Save Changes'}
              </button>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePwSubmit} className="profile-form">
              {pwMsg.text && (
                <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>
              )}
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="old_password"
                  value={pwForm.old_password}
                  onChange={handlePwChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={pwForm.new_password}
                  onChange={handlePwChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={pwForm.confirm_password}
                  onChange={handlePwChange}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loadingPw}>
                {loadingPw ? <span className="spinner-small" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
