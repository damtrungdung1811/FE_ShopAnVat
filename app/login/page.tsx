'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.status) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.vaiTro);

        if (data.user.vaiTro === 'admin' || data.user.vaiTro === 'nhanvien') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/home';
        }
      } else {
        alert(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      alert('Kết nối API thất bại');
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/css/login.css" />
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">🍜</div>
              <h1>Ăn Vặt 247</h1>
              <p>Đăng nhập để tiếp tục mua sắm</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? '⏳ Đang đăng nhập...' : '🔑 Đăng nhập'}
              </button>

              <div className="login-footer">
                Chưa có tài khoản? <Link href="#">Đăng ký ngay</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}