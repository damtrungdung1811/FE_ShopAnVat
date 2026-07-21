"use client";

import { useEffect, useMemo, useState } from "react";

type TrangThaiDonHang =
  | "dang_xu_ly"
  | "dang_giao"
  | "hoan_thanh"
  | "da_huy";

interface DonHang {
  id: number;
  khachHangId: number;
  tenKhachHang: string;
  sanPhamId: number;
  tenSanPham: string;
  soLuong: number;
  tongTien: number;
  trangThai: TrangThaiDonHang;
  ngayDat: string;
  ghiChu: string;
  isGroup?: boolean;
  groupId?: string;
  sanPhamList?: string[];
  tongSoLuong?: number;
  ghiChuText?: string;
  khachHangXacNhan?: boolean;
}

interface KhachHang {
  id: number;
  hoTen: string;
}

interface SanPham {
  id: number;
  tenSanPham: string;
  giaMoi?: number;
}

interface DonHangForm {
  khachHangId: number;
  sanPhamId: number;
  soLuong: number;
  tongTien: number;
  trangThai: TrangThaiDonHang;
  ngayDat: string;
  ghiChu: string;
}

const API_URL = "http://localhost:3001";

const emptyForm: DonHangForm = {
  khachHangId: 0,
  sanPhamId: 0,
  soLuong: 1,
  tongTien: 0,
  trangThai: "dang_xu_ly",
  ngayDat: new Date().toISOString().split("T")[0],
  ghiChu: "",
};

const trangThaiOptions: TrangThaiDonHang[] = [
  "dang_xu_ly",
  "dang_giao",
  "hoan_thanh",
  "da_huy",
];

const isTrangThaiDonHang = (value: string): value is TrangThaiDonHang => {
  return trangThaiOptions.includes(value as TrangThaiDonHang);
};

const formatCurrency = (value: number) => {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
};

const getStatusClass = (status: TrangThaiDonHang) => {
  switch (status) {
    case "hoan_thanh":
      return "done";
    case "dang_giao":
      return "delivering";
    case "dang_xu_ly":
      return "pending";
    case "da_huy":
      return "cancelled";
    default:
      return "";
  }
};

const getStatusText = (status: TrangThaiDonHang) => {
  switch (status) {
    case "hoan_thanh":
      return "Đã đến nơi";
    case "dang_giao":
      return "Đang giao";
    case "dang_xu_ly":
      return "Chưa giao / Đang xử lý";
    case "da_huy":
      return "Đã hủy";
    default:
      return status;
  }
};

export default function DonHangPage() {
  const [list, setList] = useState<DonHang[]>([]);
  const [rawList, setRawList] = useState<any[]>([]);
  const [khachHangList, setKhachHangList] = useState<KhachHang[]>([]);
  const [sanPhamList, setSanPhamList] = useState<SanPham[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DonHang | null>(null);
  const [deleteItem, setDeleteItem] = useState<DonHang | null>(null);

  const [form, setForm] = useState<DonHangForm>(emptyForm);

  const fetchDonHang = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/donhang`);
      const data = await res.json();

      const safeData = Array.isArray(data) ? data : [];
      setRawList(safeData);
      setList(processOrders(safeData));
    } catch (error) {
      console.error("Lỗi fetch đơn hàng:", error);
      setRawList([]);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKhachHang = async () => {
    try {
      const res = await fetch(`${API_URL}/khachhang`);
      const data = await res.json();
      if (res.ok) setKhachHangList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi fetch khách hàng:", error);
      setKhachHangList([]);
    }
  };

  const fetchSanPham = async () => {
    try {
      const res = await fetch(`${API_URL}/sanpham`);
      const data = await res.json();
      if (res.ok) {
        setSanPhamList(
          Array.isArray(data)
            ? data.map((item) => ({
                ...item,
                giaMoi: Number(item.giaMoi || 0),
              }))
            : []
        );
      }
    } catch (error) {
      console.error("Lỗi fetch sản phẩm:", error);
      setSanPhamList([]);
    }
  };

  useEffect(() => {
    fetchDonHang();
    fetchKhachHang();
    fetchSanPham();
  }, []);

  const processOrders = (rawData: any[]): DonHang[] => {
    const groups: Record<string, DonHang> = {};
    const individuals: DonHang[] = [];

    rawData.forEach((order) => {
      let parsedNote: any = null;
      try {
        if (order.ghiChu) parsedNote = JSON.parse(order.ghiChu);
      } catch {}

      const trangThai: TrangThaiDonHang = isTrangThaiDonHang(order.trangThai)
        ? order.trangThai
        : "dang_xu_ly";

      const noteText = parsedNote?.note || (!parsedNote ? order.ghiChu : "") || "";

      const normalizedOrder: DonHang = {
        id: Number(order.id || 0),
        khachHangId: Number(order.khachHangId || 0),
        tenKhachHang: order.tenKhachHang || "",
        sanPhamId: Number(order.sanPhamId || 0),
        tenSanPham: order.tenSanPham || "",
        soLuong: Number(order.soLuong || 0),
        tongTien: Number(order.tongTien || 0),
        trangThai,
        ngayDat: order.ngayDat ? String(order.ngayDat).slice(0, 10) : "",
        ghiChu: order.ghiChu || "",
        khachHangXacNhan: order.khachHangXacNhan || false,
      };

      if (parsedNote?.group) {
        const g = parsedNote.group;

        if (!groups[g]) {
          groups[g] = {
            ...normalizedOrder,
            isGroup: true,
            groupId: g,
            sanPhamList: [
              `${normalizedOrder.tenSanPham} (x${normalizedOrder.soLuong})`,
            ],
            tongSoLuong: normalizedOrder.soLuong,
            tongTien: Number(normalizedOrder.tongTien),
            ghiChuText: noteText,
            khachHangXacNhan: order.khachHangXacNhan || false,
          };
        } else {
          groups[g].sanPhamList!.push(
            `${normalizedOrder.tenSanPham} (x${normalizedOrder.soLuong})`
          );
          groups[g].tongSoLuong! += normalizedOrder.soLuong;
          groups[g].tongTien += Number(normalizedOrder.tongTien);
          // Nếu bất kỳ đơn nào trong nhóm đã được KH xác nhận
          if (order.khachHangXacNhan) groups[g].khachHangXacNhan = true;
        }
      } else {
        individuals.push({
          ...normalizedOrder,
          isGroup: false,
          sanPhamList: [
            `${normalizedOrder.tenSanPham || `SP #${normalizedOrder.sanPhamId}`} (x${normalizedOrder.soLuong})`,
          ],
          tongSoLuong: normalizedOrder.soLuong,
          tongTien: Number(normalizedOrder.tongTien),
          ghiChuText: noteText,
        });
      }
    });

    const merged = [...Object.values(groups), ...individuals];
    merged.sort((a, b) => b.id - a.id);
    return merged;
  };

  const filteredList = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) return list;

    return list.filter((item) => {
      const maDon = item.isGroup
        ? `g-${String(item.id).padStart(3, "0")}`.toLowerCase()
        : String(item.id).padStart(3, "0").toLowerCase();

      const tenKhachHang = (item.tenKhachHang || "").toLowerCase();
      const tenSanPham = (item.tenSanPham || "").toLowerCase();
      const dsSanPham = (item.sanPhamList || []).join(", ").toLowerCase();
      const ghiChu = (item.ghiChuText || item.ghiChu || "").toLowerCase();
      const trangThai = getStatusText(item.trangThai).toLowerCase();
      const ngayDat = (item.ngayDat || "").toLowerCase();

      return (
        maDon.includes(keyword) ||
        tenKhachHang.includes(keyword) ||
        tenSanPham.includes(keyword) ||
        dsSanPham.includes(keyword) ||
        ghiChu.includes(keyword) ||
        trangThai.includes(keyword) ||
        ngayDat.includes(keyword)
      );
    });
  }, [list, searchKeyword]);

  const tongDon = filteredList.length;
  const hoanThanh = filteredList.filter(
    (item) => item.trangThai === "hoan_thanh"
  ).length;
  const dangXuLy = filteredList.filter(
    (item) => item.trangThai === "dang_xu_ly"
  ).length;
  const dangGiao = filteredList.filter(
    (item) => item.trangThai === "dang_giao"
  ).length;
  const daHuy = filteredList.filter((item) => item.trangThai === "da_huy").length;

  const tongDoanhThu = useMemo(() => {
    return filteredList
      .filter((item) => item.trangThai === "hoan_thanh")
      .reduce((sum, item) => sum + Number(item.tongTien || 0), 0);
  }, [filteredList]);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      ...emptyForm,
      ngayDat: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const openEditModal = (item: DonHang) => {
    setEditingItem(item);
    // Lấy phần ghi chú text thuần, không hiển thị raw JSON
    const noteText = item.ghiChuText || (() => {
      try {
        if (item.ghiChu) {
          const parsed = JSON.parse(item.ghiChu);
          return parsed.note || "";
        }
        return item.ghiChu || "";
      } catch { return item.ghiChu || ""; }
    })();
    setForm({
      khachHangId: Number(item.khachHangId || 0),
      sanPhamId: Number(item.sanPhamId || 0),
      soLuong: Number(item.soLuong || 1),
      tongTien: Number(item.tongTien || 0),
      trangThai: item.trangThai,
      ngayDat: item.ngayDat ? item.ngayDat.toString().slice(0, 10) : "",
      ghiChu: noteText,
    });
    setShowModal(true);
  };

  const openDeleteModal = (item: DonHang) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    if (!form.khachHangId || !form.sanPhamId || !form.soLuong || !form.ngayDat) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const payload = {
      khachHangId: Number(form.khachHangId),
      sanPhamId: Number(form.sanPhamId),
      soLuong: Number(form.soLuong),
      tongTien: Number(form.tongTien),
      trangThai: form.trangThai,
      ngayDat: form.ngayDat,
      ghiChu: form.ghiChu,
    };

    try {
      const url = editingItem
        ? `${API_URL}/donhang/${editingItem.id}`
        : `${API_URL}/donhang`;
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lưu thất bại");
        return;
      }

      alert("Thành công!");
      setShowModal(false);
      fetchDonHang();
    } catch (error) {
      console.error(error);
      alert("Không kết nối được backend");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`${API_URL}/donhang/${deleteItem.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Xóa thành công");
        setShowDeleteModal(false);
        setDeleteItem(null);
        fetchDonHang();
      } else {
        alert("Xóa thất bại");
      }
    } catch (error) {
      console.error(error);
      alert("Không kết nối được server");
    }
  };

  const handleApprove = async (item: DonHang) => {
    if (!confirm("Xác nhận phê duyệt đơn hàng?")) return;

    try {
      let idsToUpdate: number[] = [item.id];

      if (item.isGroup && item.groupId) {
        idsToUpdate = rawList
          .filter((o) => {
            let note = null;
            try {
              if (o.ghiChu) note = JSON.parse(o.ghiChu);
            } catch {}
            return note?.group === item.groupId;
          })
          .map((o) => Number(o.id));
      }

      let successCount = 0;

      for (const id of idsToUpdate) {
        const res = await fetch(`${API_URL}/donhang/${id}/trangthai`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trangThai: "hoan_thanh" }),
        });

        if (res.ok) successCount++;
      }

      if (successCount > 0) {
        alert(`Đã phê duyệt ${successCount} đơn hàng!`);
        fetchDonHang();
      } else {
        alert("Phê duyệt thất bại");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi phê duyệt đơn hàng");
    }
  };

  const selectedSanPham = sanPhamList.find(
    (sp) => Number(sp.id) === Number(form.sanPhamId)
  );

  useEffect(() => {
    if (selectedSanPham && Number(form.soLuong) > 0) {
      setForm((prev) => ({
        ...prev,
        tongTien: Number(selectedSanPham.giaMoi || 0) * Number(prev.soLuong),
      }));
    }
  }, [form.sanPhamId, form.soLuong, selectedSanPham]);

  return (
    <div>
      <div className="stats_row">
        <div className="stat_card">
          <div className="stat_icon blue">📦</div>
          <div className="stat_info">
            <h3>{tongDon}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon green">✅</div>
          <div className="stat_info">
            <h3>{hoanThanh}</h3>
            <p>Hoàn thành</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon orange">⏳</div>
          <div className="stat_info">
            <h3>{dangXuLy}</h3>
            <p>Đang xử lý</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon blue" style={{ color: "#1a73e8" }}>
            🚚
          </div>
          <div className="stat_info">
            <h3>{dangGiao}</h3>
            <p>Đang giao</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon red">❌</div>
          <div className="stat_info">
            <h3>{daHuy}</h3>
            <p>Đã hủy</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon yellow">💰</div>
          <div className="stat_info">
            <h3>{(tongDoanhThu / 1000000).toFixed(2)}tr</h3>
            <p>Doanh thu</p>
          </div>
        </div>
      </div>

      <div className="management_header">
        <h2>Quản lý đơn hàng</h2>
        <div className="management_actions">
          <input
            type="text"
            className="search_input"
            placeholder="Tìm kiếm đơn hàng..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button className="btn btn_primary" onClick={openAddModal}>
            + Tạo đơn hàng
          </button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="management_table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>TÊN KHÁCH HÀNG</th>
              <th>SẢN PHẨM</th>
              <th>SỐ LƯỢNG</th>
              <th>TỔNG TIỀN</th>
              <th>NGÀY ĐẶT</th>
              <th>TRẠNG THÁI</th>
              <th>GHI CHÚ</th>
              <th>KH XÁC NHẬN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <tr key={item.id}>
                  <td>
                    #
                    {item.isGroup
                      ? `G-${String(item.id).padStart(3, "0")}`
                      : String(item.id).padStart(3, "0")}
                  </td>
                  <td>{item.tenKhachHang || `KH #${item.khachHangId}`}</td>
                  <td>
                    {item.sanPhamList && item.sanPhamList.length > 0
                      ? item.sanPhamList.join(", ")
                      : item.tenSanPham}
                  </td>
                  <td>{item.tongSoLuong || item.soLuong}</td>
                  <td>
                    <strong>{formatCurrency(item.tongTien)}</strong>
                  </td>
                  <td>{item.ngayDat}</td>
                  <td>
                    <span className={`status ${getStatusClass(item.trangThai)}`}>
                      • {getStatusText(item.trangThai)}
                    </span>
                  </td>
                  <td>{item.ghiChuText || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    {item.khachHangXacNhan ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        background: "#e6f4ea", color: "#137333",
                        padding: "4px 12px", borderRadius: "20px",
                        fontSize: "0.82rem", fontWeight: 600
                      }}>
                        ✅ Đã xác nhận
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        background: "#f5f5f5", color: "#999",
                        padding: "4px 12px", borderRadius: "20px",
                        fontSize: "0.82rem"
                      }}>
                        ⏳ Chưa xác nhận
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action_buttons">
                      {item.trangThai === "dang_xu_ly" && (
                        <button
                          className="action_btn"
                          style={{ background: "#10b981", color: "white" }}
                          onClick={() => handleApprove(item)}
                        >
                          ✓ Phê duyệt
                        </button>
                      )}

                      <button
                        className="action_btn action_btn_edit"
                        onClick={() => openEditModal(item)}
                      >
                        ✏️
                      </button>

                      <button
                        className="action_btn action_btn_delete"
                        onClick={() => openDeleteModal(item)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: "center" }}>
                  Không có dữ liệu đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal_overlay" onClick={() => setShowModal(false)}>
          <div className="modal_box" onClick={(e) => e.stopPropagation()}>
            <div className="modal_header">
              <h3>{editingItem ? "Cập nhật đơn hàng" : "Tạo đơn hàng mới"}</h3>
              <button className="modal_close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal_body">
              <div className="form_row">
                <div className="form_group">
                  <label>Khách hàng</label>
                  <select
                    value={form.khachHangId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        khachHangId: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>-- Chọn khách hàng --</option>
                    {khachHangList.map((kh) => (
                      <option key={kh.id} value={kh.id}>
                        {kh.hoTen}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form_group">
                  <label>Sản phẩm</label>
                  <select
                    value={form.sanPhamId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sanPhamId: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>-- Chọn sản phẩm --</option>
                    {sanPhamList.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.tenSanPham}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Số lượng</label>
                  <input
                    type="number"
                    min={1}
                    value={form.soLuong}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        soLuong: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form_group">
                  <label>Tổng tiền</label>
                  <input
                    type="number"
                    value={form.tongTien}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tongTien: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Trạng thái</label>
                  <select
                    value={form.trangThai}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isTrangThaiDonHang(value)) {
                        setForm({ ...form, trangThai: value });
                      }
                    }}
                  >
                    <option value="dang_xu_ly">Chưa giao / Đang xử lý</option>
                    <option value="dang_giao">Đang giao</option>
                    <option value="hoan_thanh">Đã đến nơi</option>
                    <option value="da_huy">Đã hủy</option>
                  </select>
                </div>

                <div className="form_group">
                  <label>Ngày đặt</label>
                  <input
                    type="date"
                    value={form.ngayDat}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ngayDat: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form_group">
                <label>Ghi chú</label>
                <textarea
                  rows={3}
                  value={form.ghiChu}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ghiChu: e.target.value,
                    })
                  }
                  placeholder="Nhập ghi chú..."
                />
              </div>
            </div>

            <div className="modal_footer">
              <button
                className="btn btn_secondary"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button className="btn btn_primary" onClick={handleSave}>
                {editingItem ? "Cập nhật" : "Tạo đơn hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteItem && (
        <div
          className="modal_overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal_box" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>
              Bạn có chắc muốn xóa đơn hàng <strong>#{deleteItem.id}</strong>?
            </p>
            <button onClick={() => setShowDeleteModal(false)}>Hủy</button>
            <button
              onClick={handleDelete}
              style={{ background: "red", color: "white" }}
            >
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}