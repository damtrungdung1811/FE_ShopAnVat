"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001/thongke";

export default function ThongKe() {
  const [loading, setLoading] = useState(true);

  // States
  const [tongKet, setTongKet] = useState<any>({});
  const [doanhThuThang, setDoanhThuThang] = useState<any[]>([]);
  const [doanhThu7Ngay, setDoanhThu7Ngay] = useState<any[]>([]);
  const [topSanPham, setTopSanPham] = useState<any[]>([]);
  const [trangThaiDon, setTrangThaiDon] = useState<any>({});
  const [dashboard, setDashboard] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const year = new Date().getFullYear();
        const [
          tongKetRes,
          thangRes,
          ngayRes,
          spRes,
          trangThaiRes,
          dashRes,
        ] = await Promise.all([
          fetch(`${API_URL}/tong-ket?year=${year}`).then((res) => res.json()),
          fetch(`${API_URL}/doanhthu-thang?year=${year}`).then((res) => res.json()),
          fetch(`${API_URL}/doanhthu-7ngay`).then((res) => res.json()),
          fetch(`${API_URL}/top-sanpham?limit=8`).then((res) => res.json()),
          fetch(`${API_URL}/don-hang-trang-thai`).then((res) => res.json()),
          fetch(`${API_URL}/dashboard`).then((res) => res.json()),
        ]);

        if (tongKetRes.status) setTongKet(tongKetRes.data);
        if (thangRes.status) setDoanhThuThang(thangRes.data);
        if (ngayRes.status) setDoanhThu7Ngay(ngayRes.data);
        if (spRes.status) setTopSanPham(spRes.data);
        if (trangThaiRes.status) setTrangThaiDon(trangThaiRes.data);
        if (dashRes.status) setDashboard(dashRes.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatVND = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";
  const formatShort = (n: number) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "tr";
    if (n >= 1000) return (n / 1000).toFixed(0) + "k";
    return n.toString();
  };

  const tinhPhanTram = (nay: number, truoc: number) => {
    if (!truoc) return nay > 0 ? 100 : 0;
    return (((nay - truoc) / truoc) * 100).toFixed(1);
  };

  const phanTramDoanhThu = tinhPhanTram(
    dashboard.doanhThuThangNay || 0,
    dashboard.doanhThuThangTruoc || 0
  );

  const maxBarThang = Math.max(1, ...doanhThuThang.map((m) => m.doanhThu));
  const maxBarNgay = Math.max(1, ...doanhThu7Ngay.map((d) => d.doanhThu));
  const maxSanPham = topSanPham.length > 0 ? topSanPham[0].soLuong : 1;

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải dữ liệu thống kê...</div>;
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="thongke_grid">
        <div className="thongke_card revenue">
          <div className="thongke_label">💰 Doanh thu tháng này</div>
          <div className="thongke_value">{formatVND(dashboard.doanhThuThangNay)}</div>
          <div className={`thongke_change ${Number(phanTramDoanhThu) >= 0 ? "up" : "down"}`}>
            {Number(phanTramDoanhThu) >= 0 ? "↑" : "↓"} {Math.abs(Number(phanTramDoanhThu))}% so với tháng trước
          </div>
        </div>

        <div className="thongke_card orders">
          <div className="thongke_label">📦 Tổng đơn hàng</div>
          <div className="thongke_value">{dashboard.donHang || 0}</div>
          <div className="thongke_change up">{' '}</div>
        </div>

        <div className="thongke_card products">
          <div className="thongke_label">☕ Sản phẩm đã bán</div>
          <div className="thongke_value">{tongKet.tongSanPhamBan || 0}</div>
          <div className="thongke_change up">{' '}</div>
        </div>

        <div className="thongke_card customers">
          <div className="thongke_label">👥 Khách hàng mua</div>
          <div className="thongke_value">{tongKet.khachHangMua || 0}</div>
          <div className="thongke_change up">{' '}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="chart_grid">
        {/* Revenue chart by month */}
        <div className="chart_box">
          <h4>📊 Doanh thu theo tháng ({new Date().getFullYear()})</h4>
          <div className="bar_chart">
            {doanhThuThang.map((m, i) => (
              <div className="bar_item" key={i}>
                <div className="bar_value">{formatShort(m.doanhThu)}</div>
                <div
                  className="bar"
                  style={{
                    height: `${(m.doanhThu / maxBarThang) * 100}%`,
                    background: i === new Date().getMonth()
                      ? "linear-gradient(180deg, #3b82f6, #6366f1)"
                      : "linear-gradient(180deg, #93c5fd, #bfdbfe)",
                  }}
                  title={formatVND(m.doanhThu)}
                />
                <div className="bar_label">{m.thang}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="chart_box">
          <h4>🏆 Sản phẩm bán chạy</h4>
          <div className="top_products">
            {topSanPham.length > 0 ? (
              topSanPham.map((sp, i) => (
                <div className="product_row" key={i}>
                  <div className={`product_rank ${i === 0 ? "rank_1" : i === 1 ? "rank_2" : i === 2 ? "rank_3" : "rank_other"}`}>
                    {i + 1}
                  </div>
                  <div className="product_detail">
                    <div className="product_name">{sp.ten}</div>
                    <div className="product_bar_bg">
                      <div className="product_bar_fill" style={{ width: `${(sp.soLuong / maxSanPham) * 100}%`, background: sp.color || "#8b1a1a" }} />
                    </div>
                  </div>
                  <div className="product_sold">{sp.soLuong}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#888", marginTop: 20 }}>Chưa có dữ liệu sản phẩm bán ra</div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly revenue + Revenue details */}
      <div className="chart_grid">
        <div className="chart_box">
          <h4>📋 Chi tiết doanh thu 7 ngày gần nhất</h4>
          <table className="revenue_table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số đơn</th>
                <th>Doanh thu</th>
                <th>TB/đơn</th>
              </tr>
            </thead>
            <tbody>
              {doanhThu7Ngay.length > 0 ? (
                doanhThu7Ngay.map((row, i) => (
                  <tr key={i}>
                    <td><b>{row.ngay}</b></td>
                    <td>{row.soDon} đơn</td>
                    <td className="price">{formatVND(row.doanhThu)}</td>
                    <td>{formatVND(row.soDon > 0 ? row.doanhThu / row.soDon : 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="chart_box">
          <h4>📈 Doanh thu 7 ngày</h4>
          <div className="bar_chart">
            {doanhThu7Ngay.map((d, i) => (
              <div className="bar_item" key={i}>
                <div className="bar_value">{formatShort(d.doanhThu)}</div>
                <div
                  className="bar"
                  style={{
                    height: `${(d.doanhThu / maxBarNgay) * 100}%`,
                    background: i === doanhThu7Ngay.length - 1 
                      ? "linear-gradient(180deg, #10b981, #059669)" 
                      : "linear-gradient(180deg, #6ee7b7, #a7f3d0)",
                  }}
                  title={formatVND(d.doanhThu)}
                />
                <div className="bar_label">{d.thu}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trạng thái đơn hàng + Tổng kết */}
      <div className="chart_grid">
        <div className="chart_box">
          <h4>📊 Phân bổ trạng thái đơn hàng</h4>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#f59e0b" }}>{trangThaiDon.dang_xu_ly || 0}</div>
              <div style={{ color: "#666" }}>Đang xử lý</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#3b82f6" }}>{trangThaiDon.dang_giao || 0}</div>
              <div style={{ color: "#666" }}>Đang giao</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#10b981" }}>{trangThaiDon.hoan_thanh || 0}</div>
              <div style={{ color: "#666" }}>Hoàn thành</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#ef4444" }}>{trangThaiDon.da_huy || 0}</div>
              <div style={{ color: "#666" }}>Đã hủy</div>
            </div>
          </div>
        </div>

        <div className="table_section" style={{ margin: 0, border: "1px solid #eee", boxShadow: "none" }}>
          <h4>📊 Tổng kết năm {new Date().getFullYear()}</h4>
          <div className="stats_row" style={{ marginTop: 16 }}>
            <div className="stat_card" style={{ padding: "10px" }}>
              <div className="stat_icon green" style={{ width: 40, height: 40, fontSize: "1.2rem" }}>💰</div>
              <div className="stat_info">
                <h3>{formatShort(tongKet.tongDoanhThu)}</h3>
                <p>Tổng doanh thu</p>
              </div>
            </div>
            <div className="stat_card" style={{ padding: "10px" }}>
              <div className="stat_icon blue" style={{ width: 40, height: 40, fontSize: "1.2rem" }}>📦</div>
              <div className="stat_info">
                <h3>{tongKet.tongDon || 0}</h3>
                <p>Tổng đơn hàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
