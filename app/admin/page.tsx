"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface KhachHang {
  id: number;
  hoTen: string;
}

interface SanPham {
  id: number;
  tenSanPham: string;
  danhMucId: number;
}

interface DonHang {
  id: number;
  khachHangId: number;
  tenKhachHang?: string;
  sanPhamId: number;
  tenSanPham?: string;
  tongTien: number;
  trangThai: string;
}

const API_URL = "http://localhost:3001";

const formatCurrency = (value: number) => {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "hoan_thanh":
      return "done";
    case "dang_xu_ly":
      return "pending";
    case "da_huy":
      return "cancelled";
    default:
      return "";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "hoan_thanh":
      return "Hoàn thành";
    case "dang_xu_ly":
      return "Đang xử lý";
    case "da_huy":
      return "Đã hủy";
    default:
      return status;
  }
};

export default function AdminPage() {
  const [stats, setStats] = useState({
    sanPham: 0,
    donHang: 0,
    khachHang: 0,
    nhanVien: 0,
    doanhThuThangNay: 0,
    doanhThuThangTruoc: 0,
  });

  const [recentOrders, setRecentOrders] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, dhRes, khRes, spRes] = await Promise.all([
          fetch(`${API_URL}/thongke/dashboard`),
          fetch(`${API_URL}/donhang`),
          fetch(`${API_URL}/khachhang`),
          fetch(`${API_URL}/sanpham`),
        ]);

        const dashboardData = await dashRes.json();
        const donHangList = await dhRes.json();
        const khachHangList = await khRes.json();
        const sanPhamList = await spRes.json();

        if (dashboardData.status) {
          setStats(dashboardData.data);
        }

        // Recent Orders
        if (
          Array.isArray(donHangList) &&
          Array.isArray(khachHangList) &&
          Array.isArray(sanPhamList)
        ) {
          // Sort descending by id to get newest
          const sorted = [...donHangList].sort(
            (a, b) => Number(b.id) - Number(a.id)
          );
          const top5 = sorted.slice(0, 5);

          // Map missing names if any
          const mappedTop5 = top5.map((order) => {
            const kh = khachHangList.find((k: KhachHang) => k.id === order.khachHangId);
            const sp = sanPhamList.find((s: SanPham) => s.id === order.sanPhamId);
            return {
              ...order,
              tenKhachHang:
                order.tenKhachHang || kh?.hoTen || `Khách hàng #${order.khachHangId}`,
              tenSanPham:
                order.tenSanPham || sp?.tenSanPham || `Sản phẩm #${order.sanPhamId}`,
            };
          });

          setRecentOrders(mappedTop5);
        }
      } catch (error) {
        console.error("Lỗi fetch dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const tinhPhanTram = (nay: number, truoc: number) => {
    if (truoc === 0) return nay > 0 ? 100 : 0;
    return (((nay - truoc) / truoc) * 100).toFixed(1);
  };
  const phanTramDoanhThu = tinhPhanTram(stats.doanhThuThangNay, stats.doanhThuThangTruoc);

  return (
    <div>
      {/* Dashboard Cards */}
      <div className="dashboard_grid">
        <div className="dashboard_card card_blue">
          <div className="card_icon blue">💰</div>
          <div className="card_info">
            <h2>{loading ? "..." : formatCurrency(stats.doanhThuThangNay)}</h2>
            <p>Doanh thu tháng này</p>
          </div>
          <span className={`card_trend ${Number(phanTramDoanhThu) >= 0 ? "up" : "down"}`}>
            {Number(phanTramDoanhThu) >= 0 ? "↑" : "↓"} {Math.abs(Number(phanTramDoanhThu))}%
          </span>
        </div>

        <div className="dashboard_card card_green">
          <div className="card_icon green">📦</div>
          <div className="card_info">
            <h2>{loading ? "..." : stats.donHang}</h2>
            <p>Tổng đơn hàng</p>
          </div>
          <span className="card_trend up">—</span>
        </div>

        <div className="dashboard_card card_purple">
          <div className="card_icon purple">👥</div>
          <div className="card_info">
            <h2>{loading ? "..." : stats.khachHang}</h2>
            <p>Khách hàng</p>
          </div>
          <span className="card_trend up">—</span>
        </div>

        <div className="dashboard_card card_orange">
          <div className="card_icon orange">🍟</div>
          <div className="card_info">
            <h2>{loading ? "..." : stats.sanPham}</h2>
            <p>Tổng sản phẩm</p>
          </div>
          <span className="card_trend down">—</span>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard_bottom">
        {/* Recent Orders */}
        <div className="table_section">
          <h4>📋 Đơn hàng gần đây</h4>

          <table className="recent_table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><b>#{String(order.id).padStart(3, "0")}</b></td>
                    <td>{order.tenKhachHang}</td>
                    <td>{order.tenSanPham}</td>
                    <td className="price">{formatCurrency(order.tongTien)}</td>
                    <td>
                      <span className={`status ${getStatusClass(order.trangThai)}`}>
                        {getStatusText(order.trangThai)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>Chưa có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="table_section">
          <h4>⚡ Thao tác nhanh</h4>

          <div className="quick_actions">
            <Link href="/admin/sanpham" style={{ textDecoration: "none" }}>
              <button className="quick_action_btn">
                <div className="qa_icon" style={{ background: "#fce4ec" }}>🍟</div>
                <div>
                  <div className="qa_text">Sản phẩm</div>
                  <div className="qa_desc">Thêm món mới</div>
                </div>
              </button>
            </Link>

            <Link href="/admin/donhang" style={{ textDecoration: "none" }}>
              <button className="quick_action_btn">
                <div className="qa_icon" style={{ background: "#e8f5e9" }}>📦</div>
                <div>
                  <div className="qa_text">Đơn hàng</div>
                  <div className="qa_desc">Tạo đơn mới</div>
                </div>
              </button>
            </Link>

            <Link href="/admin/khachhang" style={{ textDecoration: "none" }}>
              <button className="quick_action_btn">
                <div className="qa_icon" style={{ background: "#fff8e1" }}>👥</div>
                <div>
                  <div className="qa_text">Khách hàng</div>
                  <div className="qa_desc">Quản lý KH</div>
                </div>
              </button>
            </Link>

            <Link href="/admin/nhanvien" style={{ textDecoration: "none" }}>
              <button className="quick_action_btn">
                <div className="qa_icon" style={{ background: "#fff3e0" }}>👨‍💼</div>
                <div>
                  <div className="qa_text">Nhân viên</div>
                  <div className="qa_desc">Quản lý NV</div>
                </div>
              </button>
            </Link>

            <Link href="/admin/quanlykho" style={{ textDecoration: "none" }}>
              <button className="quick_action_btn">
                <div className="qa_icon" style={{ background: "#f9f5ea" }}>🏪</div>
                <div>
                  <div className="qa_text">Quản lý kho</div>
                  <div className="qa_desc">Kiểm tra tồn kho</div>
                </div>
              </button>
            </Link>

            <Link href="/admin/taikhoan" style={{ textDecoration: "none" }}>
              <button className="quick_action_btn">
                <div className="qa_icon" style={{ background: "#ffebee" }}>🔐</div>
                <div>
                  <div className="qa_text">Tài khoản</div>
                  <div className="qa_desc">Quản lý TK</div>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}