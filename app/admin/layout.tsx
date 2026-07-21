"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("admin");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const mainMenu = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/sanpham", label: "Sản phẩm", icon: "🍟" },
    { href: "/admin/donhang", label: "Đơn hàng", icon: "📦" },
    { href: "/admin/khachhang", label: "Khách hàng", icon: "👥" },
    ...(role !== "nhanvien" ? [{ href: "/admin/nhanvien", label: "Nhân viên", icon: "👨‍💼" }] : []),
  ];

  const khoMenu = [
    { href: "/admin/quanlykho", label: "Quản lý kho", icon: "🏪" },
    ...(role !== "nhanvien" ? [{ href: "/admin/thongke", label: "Thống kê", icon: "📈" }] : []),
    ...(role !== "nhanvien" ? [{ href: "/admin/hoadon", label: "Hóa đơn xuất", icon: "🧾" }] : []),
  ];

  const systemMenu = role !== "nhanvien" ? [
    { href: "/admin/taikhoan", label: "Tài khoản", icon: "🔐" },
  ] : [];

  const publicMenu = [
    { href: "/home", label: "Về trang chủ", icon: "🏠" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const renderMenu = (items: typeof mainMenu) => (
    <ul>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={isActive(item.href) ? "active" : ""}>
            <span className="sidebar_icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <link rel="stylesheet" href="/css/admin.css" />
      <div className="admin_container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">
          🍜 <span>Ăn Vặt 247</span>
        </h2>

        <nav className="sidebar_nav">
          <div className="sidebar_label">Menu chính</div>
          {renderMenu(mainMenu)}

          <div className="sidebar_label">Kho & Báo cáo</div>
          {renderMenu(khoMenu)}

          {systemMenu.length > 0 && (
            <>
              <div className="sidebar_label">Hệ thống</div>
              {renderMenu(systemMenu)}
            </>
          )}

          <div className="sidebar_label">Ngoài khách</div>
          {renderMenu(publicMenu)}
        </nav>

        <div className="sidebar_footer">
          <div className="sidebar_avatar">{role === "nhanvien" ? "N" : "A"}</div>
          <div className="sidebar_user_info">
            <p>{role === "nhanvien" ? "Nhân viên" : "Admin"}</p>
            <span>{role === "nhanvien" ? "Nhân viên bán hàng" : "Quản trị viên"}</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className="admin_header">
          <h3>🍜 Hệ thống quản lý Ăn Vặt 247</h3>

          <div className="header_right">
            <button className="header_notification">
              🔔
              <span className="notification_dot"></span>
            </button>

            <div 
              className="admin_user" 
              style={{ cursor: 'pointer', position: 'relative' }} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            >
              <div className="user_avatar">{role === "nhanvien" ? "N" : "A"}</div>
              <span>Xin chào, <b>{role === "nhanvien" ? "Nhân viên" : "Admin"}</b></span>
              
              {isDropdownOpen && (
                <div className="admin_user_dropdown">
                  <div className="dropdown_item">Sửa thông tin</div>
                  <div className="dropdown_item">Đổi mật khẩu</div>
                  <div className="dropdown_divider"></div>
                  <div 
                    className="dropdown_item text-danger" 
                    onClick={(e) => { 
                      e.stopPropagation(); // prevent toggling
                      localStorage.removeItem("userRole"); 
                      router.push("/login"); 
                    }}
                  >
                    Đăng xuất
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>   

        {/* CONTENT */}
        <div className="admin_content">{children}</div>

      </div>
    </div>
    </>
  );
}