"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [user, setUser] = useState<{ ten?: string; hoTen?: string; username?: string; vaiTro: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { getTotalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    setUser(null);
    window.location.href = "/login";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/home/timkiem?q=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const navItems = [
    { label: "Trang chủ", href: "/home" },
    { label: "Giới thiệu", href: "/home/gioithieu" },
    { label: "Đồ ăn vặt", href: "/home/doanvat" },
    { label: "Đồ ăn đêm", href: "/home/doandem" },
    { label: "Đồ uống", href: "/home/douong" },
    { label: "Tin tức", href: "/home/tintuc" },
  ];

  return (
    <>
      <link rel="stylesheet" href="/css/home.css" />
      {/* Floating Chat Buttons */}
      <div className="floating-buttons">
        <button className="float-btn zalo">💬 Chat Zalo</button>
        <button className="float-btn facebook">💬 Chat Facebook</button>
        <button className="float-btn hotline">📞 Hotline: 0986.989.626</button>
      </div>

      {/* Header */}
      <header className="site-header">
        <div className="header-top">
          <Link href="/home" className="logo">
            <div className="logo-icon">🍜</div>
            <span>Ăn Vặt 247</span>
          </Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Bạn muốn mua gì?" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>

          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link href="/home/cart" className="cart-icon" style={{ textDecoration: "none", color: "inherit" }}>
              🛒 <span className="cart-badge">{mounted ? getTotalItems() : 0}</span> Giỏ hàng
            </Link>

            {user ? (
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className="login-btn" style={{ background: "transparent", color: "var(--primary-color)", border: "1px solid var(--primary-color)" }}>
                  👤 Xin chào, {user.hoTen || user.ten || (user.vaiTro === 'admin' ? 'Admin' : user.vaiTro === 'nhanvien' ? 'Nhân viên' : user.username || 'Khách hàng')}
                </div>
                {isDropdownOpen && (
                  <div style={{
                    position: "absolute", top: "100%", right: 0, marginTop: "8px",
                    background: "white", padding: "10px", borderRadius: "8px", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: "180px", zIndex: 100
                  }}>
                    <Link href="/home/donhang" style={{ display: "block", padding: "8px", color: "#333", textDecoration: "none", borderBottom: "1px solid #eee", fontWeight: 500 }}>📦 Đơn hàng của tôi</Link>
                    {(user.vaiTro === "admin" || user.vaiTro === "nhanvien") && (
                      <Link href="/admin" style={{ display: "block", padding: "8px", color: "#333", textDecoration: "none", borderBottom: "1px solid #eee", fontWeight: 500 }}>⚙️ Về trang Quản trị</Link>
                    )}
                    <div onClick={handleLogout} style={{ display: "block", padding: "8px", color: "red", cursor: "pointer", fontWeight: 500 }}>Đăng xuất</div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="login-btn">
                👤 Đăng nhập
              </Link>
            )}
          </div>
        </div>

        <nav className="main-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={pathname === item.href ? "active" : ""}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Ăn Vặt 247</h3>
            <p>
              Giao hàng mọi nơi trong thời gian nhanh nhất, nhận hàng nhanh
              chóng. Hình ảnh chụp thật 100%, đảm bảo sản phẩm đúng như hình
              đăng tải. Liên hệ tư vấn nhanh chóng khi khách hàng đặt sản
              phẩm.
            </p>
          </div>
          <div className="footer-section">
            <h3>Thông tin liên hệ</h3>
            <ul>
              <li>🏪 Ăn Vặt 247</li>
              <li>📍 335 Cầu Giấy - Hà Nội</li>
              <li>📧 Email: topweb.com.vn@gmail.com</li>
              <li>📞 Điện thoại: 0986.989.626</li>
              <li>☎️ Hotline: 0986.989.626</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Fanpage Facebook</h3>
            <p>
              Theo dõi chúng tôi trên Facebook để cập nhật tin tức mới nhất về
              đồ ăn vặt và các chương trình khuyến mại hấp dẫn!
            </p>
            <p style={{ marginTop: "10px" }}>
              <Link
                href="#"
                style={{
                  background: "#1877F2",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                👍 Theo dõi Trang
              </Link>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          Copyright 2026 © Thiết kế website Hà Nội bởi Topweb.com.vn
        </div>
      </footer>
    </>
  );
}
