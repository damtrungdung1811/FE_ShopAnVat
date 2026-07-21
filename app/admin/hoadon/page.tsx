"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3001";

interface Invoice {
  id: number;
  khachHangId: number;
  tenKhachHang: string;
  sanPhamId: number;
  tenSanPham: string;
  soLuong: number;
  tongTien: number;
  trangThai: string;
  ngayDat: string;
  ghiChu: string;
  isGroup?: boolean;
  groupId?: string;
  sanPhamList?: string[];
  tongSoLuong?: number;
}

export default function HoaDonManagementPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  
  // Tổng quan
  const [tongSoHoaDon, setTongSoHoaDon] = useState(0);
  const [tongDoanhThu, setTongDoanhThu] = useState(0);

  // Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/donhang`);
      const donhangRes = await res.json();

      const safeData = Array.isArray(donhangRes) ? donhangRes : [];
      // Lọc các đơn hàng đã hoàn thành (đã thanh toán) -> Hóa đơn
      const completedOrders = processOrders(safeData).filter(
        (order) => order.trangThai === "hoan_thanh"
      );
      
      setInvoices(completedOrders);

      // Tính thống kê trực tiếp từ các đơn đã bán & thanh toán
      setTongSoHoaDon(completedOrders.length);
      const doanhThu = completedOrders.reduce((sum, order) => sum + (Number(order.tongTien) || 0), 0);
      setTongDoanhThu(doanhThu);

    } catch (err) {
      console.error("Lỗi lấy dữ liệu hóa đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  const processOrders = (rawData: any[]): Invoice[] => {
    const groups: Record<string, Invoice> = {};
    const individuals: Invoice[] = [];

    rawData.forEach((order) => {
      let parsedNote: any = null;
      try {
        if (order.ghiChu) parsedNote = JSON.parse(order.ghiChu);
      } catch {}

      const normalizedOrder: Invoice = {
        id: Number(order.id || 0),
        khachHangId: Number(order.khachHangId || 0),
        tenKhachHang: order.tenKhachHang || "",
        sanPhamId: Number(order.sanPhamId || 0),
        tenSanPham: order.tenSanPham || "",
        soLuong: Number(order.soLuong || 0),
        tongTien: Number(order.tongTien || 0),
        trangThai: order.trangThai,
        ngayDat: order.ngayDat ? String(order.ngayDat).slice(0, 10) : "",
        ghiChu: order.ghiChu || "",
      };

      if (parsedNote?.group) {
        const g = parsedNote.group;
        if (!groups[g]) {
          groups[g] = {
            ...normalizedOrder,
            isGroup: true,
            groupId: g,
            sanPhamList: [`${normalizedOrder.tenSanPham} (x${normalizedOrder.soLuong})`],
            tongSoLuong: normalizedOrder.soLuong,
            tongTien: Number(normalizedOrder.tongTien),
          };
        } else {
          groups[g].sanPhamList!.push(`${normalizedOrder.tenSanPham} (x${normalizedOrder.soLuong})`);
          groups[g].tongSoLuong! += normalizedOrder.soLuong;
          groups[g].tongTien += Number(normalizedOrder.tongTien);
        }
      } else {
        individuals.push({
          ...normalizedOrder,
          isGroup: false,
          sanPhamList: [`${normalizedOrder.tenSanPham} (x${normalizedOrder.soLuong})`],
          tongSoLuong: normalizedOrder.soLuong,
          tongTien: Number(normalizedOrder.tongTien),
        });
      }
    });

    const merged = [...Object.values(groups), ...individuals];
    merged.sort((a, b) => b.id - a.id);
    return merged;
  };

  const formatVND = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return invoices;

    return invoices.filter((item) => {
      const maDon = item.isGroup ? `HD-G${item.id}`.toLowerCase() : `HD-${item.id}`.toLowerCase();
      const tenKh = (item.tenKhachHang || "").toLowerCase();
      const sp = (item.sanPhamList || []).join(" ").toLowerCase();
      return maDon.includes(keyword) || tenKh.includes(keyword) || sp.includes(keyword);
    });
  }, [invoices, searchKeyword]);

  return (
    <>
      <link rel="stylesheet" href="/css/hoadon.css" />
      
      <div className="invoice_management_wrapper">
        <h1 style={{ marginBottom: "25px", color: "#1e293b" }}>🧾 Quản Lý Hóa Đơn Bán Hàng</h1>

        {/* THỐNG KÊ TỔNG QUAN */}
        <div className="invoice_stats_grid">
          <div className="stat_card_invoice">
            <div className="stat_icon_invoice">📦</div>
            <div className="stat_info_invoice">
              <h3>{tongSoHoaDon}</h3>
              <p>Hóa đơn đã bán</p>
            </div>
          </div>

          <div className="stat_card_invoice revenue">
            <div className="stat_icon_invoice">💰</div>
            <div className="stat_info_invoice">
              <h3 style={{ color: "#10b981" }}>{formatVND(tongDoanhThu)}</h3>
              <p>Tổng doanh thu</p>
            </div>
          </div>
        </div>

        {/* BẢNG QUẢN LÝ HÓA ĐƠN */}
        <div className="invoice_table_container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h2>Danh sách hóa đơn</h2>
            <input 
              type="text" 
              className="invoice_table_search" 
              placeholder="🔍 Tìm mã HĐ, tên khách hàng..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: "300px", marginBottom: "20px" }}
            />
          </div>

          {loading ? (
            <p>Đang tải dữ liệu hóa đơn...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin_invoice_table">
                <thead>
                  <tr>
                    <th>Mã Hóa Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Sản Phẩm</th>
                    <th>Ngày Xuất</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td><strong>{inv.isGroup ? `HD-G${String(inv.id).padStart(3,"0")}` : `HD-${String(inv.id).padStart(3,"0")}`}</strong></td>
                        <td>{inv.tenKhachHang || `Khách hàng #${inv.khachHangId}`}</td>
                        <td style={{ maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {inv.sanPhamList?.join(", ")}
                        </td>
                        <td>{inv.ngayDat}</td>
                        <td style={{ fontWeight: 600, color: "#10b981" }}>{formatVND(inv.tongTien)}</td>
                        <td><span className="badge_success">Đã thu tiền</span></td>
                        <td>
                          <button className="btn_view_invoice" onClick={() => setSelectedInvoice(inv)}>
                            👁️ Xem / In
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        Không tìm thấy hóa đơn nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL IN HÓA ĐƠN CHI TIẾT */}
      {selectedInvoice && (
        <div className="invoice_modal_overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="invoice_modal_content" onClick={(e) => e.stopPropagation()}>
            
            <div className="invoice_modal_actions">
              <button className="btn_modal_close" onClick={() => setSelectedInvoice(null)}>Đóng</button>
              <button className="btn_modal_print" onClick={handlePrint}>
                🖨️ In Hóa Đơn
              </button>
            </div>

            {/* TỜ HÓA ĐƠN BÁN LẺ (SẼ ĐƯỢC IN) */}
            <div className="receipt_paper">
              <div className="receipt_header">
                <h1>ĂN VẶT 247</h1>
                <p>📍 123 Đường Bán Hàng, Quận 1, TP.HCM</p>
                <p>📞 SĐT: 0123.456.789</p>
                <h2 style={{ marginTop: "15px", fontSize: "1.3rem" }}>HÓA ĐƠN THANH TOÁN</h2>
              </div>

              <div className="receipt_info">
                <div className="receipt_info_row">
                  <span>Mã HĐ:</span>
                  <span>{selectedInvoice.isGroup ? `HD-G${String(selectedInvoice.id).padStart(3,"0")}` : `HD-${String(selectedInvoice.id).padStart(3,"0")}`}</span>
                </div>
                <div className="receipt_info_row">
                  <span>Ngày in:</span>
                  <span>{new Date().toLocaleString('vi-VN')}</span>
                </div>
                <div className="receipt_info_row">
                  <span>Khách hàng:</span>
                  <span>{selectedInvoice.tenKhachHang || `Khách Hàng #${selectedInvoice.khachHangId}`}</span>
                </div>
              </div>

              <table className="receipt_table">
                <thead>
                  <tr>
                    <th>Tên Món</th>
                    <th className="right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.sanPhamList?.map((sp, idx) => {
                    // sp thường có dạng "Tên Món (xSố lượng)"
                    return (
                      <tr key={idx}>
                        <td>{sp}</td>
                        <td className="right">-</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="receipt_totals">
                <div className="receipt_total_row">
                  <span>Tổng số lượng:</span>
                  <span>{selectedInvoice.tongSoLuong || selectedInvoice.soLuong} phần</span>
                </div>
                <div className="receipt_total_row grand">
                  <span>Tổng cộng:</span>
                  <span>{formatVND(selectedInvoice.tongTien)}</span>
                </div>
              </div>

              <div className="receipt_footer">
                <p>Cảm ơn quý khách đã mua hàng!</p>
                <p>Hẹn gặp lại quý khách.</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
