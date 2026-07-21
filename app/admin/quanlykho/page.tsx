"use client";

import { useEffect, useMemo, useState } from "react";

interface KhoItem {
  id: number;
  sanPhamId: number;
  tenSanPham: string;
  danhMuc: string;
  danhMucId?: number;
  nhapVao: number;
  daDung: number;
  soLuongTon: number;
  giaNhap: number;
  trangThai: string;
  mucCanhBao?: number;
  viTriKho?: string;
  updated_at?: string;
  tyLeTon?: number;
}

const API_URL = "http://localhost:3001";

const emptyForm = {
  tenSanPham: "",
  danhMucId: 1,
  nhapVao: 0,
  daDung: 0,
  soLuongTon: 0,
  giaNhap: 0,
  mucCanhBao: 10,
  viTriKho: "",
};

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

const getTrangThaiClass = (trangThai: string) => {
  switch (trangThai) {
    case "Còn hàng":
      return "done";
    case "Sắp hết":
      return "pending";
    case "Hết hàng":
      return "cancelled";
    default:
      return "";
  }
};

export default function QuanLyKhoPage() {
  const [list, setList] = useState<KhoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KhoItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<KhoItem | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const fetchKho = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/quanlykho`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi lấy dữ liệu kho");
        return;
      }

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi fetch kho:", error);
      alert("Không thể kết nối backend /quanlykho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKho();
  }, []);

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);

    try {
      if (!keyword.trim()) {
        fetchKho();
        return;
      }

      const res = await fetch(
        `${API_URL}/quanlykho/timkiem?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi tìm kiếm kho");
        return;
      }

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Không thể tìm kiếm dữ liệu kho");
    }
  };

  const tongMatHang = list.length;
  const conHang = list.filter((item) => item.trangThai === "Còn hàng").length;
  const sapHet = list.filter((item) => item.trangThai === "Sắp hết").length;
  const hetHang = list.filter((item) => item.trangThai === "Hết hàng").length;

  const giaTriTonKho = useMemo(() => {
    return list.reduce((sum, item) => {
      return sum + Number(item.soLuongTon || 0) * Number(item.giaNhap || 0);
    }, 0);
  }, [list]);

  const openAddModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item: KhoItem) => {
    setEditingItem(item);
    setForm({
      tenSanPham: item.tenSanPham || "",
      danhMucId: Number(item.danhMucId || 1),
      nhapVao: Number(item.nhapVao || 0),
      daDung: Number(item.daDung || 0),
      soLuongTon: Number(item.soLuongTon || 0),
      giaNhap: Number(item.giaNhap || 0),
      mucCanhBao: Number(item.mucCanhBao || 10),
      viTriKho: item.viTriKho || "",
    });
    setShowModal(true);
  };

  const openDeleteModal = (item: KhoItem) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!form.tenSanPham.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!form.viTriKho.trim()) {
      alert("Vui lòng nhập vị trí kho");
      return;
    }

    const payload = {
      tenSanPham: form.tenSanPham.trim(),
      danhMucId: Number(form.danhMucId),
      nhapVao: Number(form.nhapVao),
      daDung: Number(form.daDung),
      soLuongTon: Number(form.soLuongTon),
      giaNhap: Number(form.giaNhap),
      mucCanhBao: Number(form.mucCanhBao),
      viTriKho: form.viTriKho,
    };

    try {
      let res: Response;

      if (editingItem) {
        res = await fetch(`${API_URL}/quanlykho/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/quanlykho`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lưu dữ liệu thất bại");
        return;
      }

      alert(data.message || "Thành công");
      setShowModal(false);
      resetForm();
      fetchKho();
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      alert("Không thể kết nối backend");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`${API_URL}/quanlykho/${deleteItem.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Xóa thất bại");
        return;
      }

      alert(data.message || "Xóa thành công");
      setShowDeleteModal(false);
      setDeleteItem(null);
      fetchKho();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      alert("Không thể kết nối backend");
    }
  };

  return (
    <div>
      <div className="stats_row">
        <div className="stat_card">
          <div className="stat_icon blue">🏬</div>
          <div className="stat_info">
            <h3>{tongMatHang}</h3>
            <p>Tổng mặt hàng</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon green">✅</div>
          <div className="stat_info">
            <h3>{conHang}</h3>
            <p>Còn hàng</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon orange">⚠️</div>
          <div className="stat_info">
            <h3>{sapHet}</h3>
            <p>Sắp hết</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon red">❌</div>
          <div className="stat_info">
            <h3>{hetHang}</h3>
            <p>Hết hàng</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon yellow">💰</div>
          <div className="stat_info">
            <h3>{(giaTriTonKho / 1000000).toFixed(2)}tr</h3>
            <p>Giá trị tồn kho</p>
          </div>
        </div>
      </div>

      <div className="table_section">
        <div className="management_header">
          <h2>Quản lý kho</h2>

          <div className="management_actions">
            <input
              type="text"
              className="search_input"
              placeholder="Tìm kiếm trong kho..."
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <button className="btn btn_primary" onClick={openAddModal}>
              + Nhập kho
            </button>
          </div>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="management_table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TÊN SẢN PHẨM</th>
                <th>DANH MỤC</th>
                <th>NHẬP VÀO</th>
                <th>ĐÃ DÙNG</th>
                <th>TỒN KHO</th>
                <th>TỶ LỆ TỒN</th>
                <th>GIÁ NHẬP</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>

            <tbody>
              {list.length > 0 ? (
                list.map((item) => {
                  const nhapVao = Number(item.nhapVao || 0);
                  const daDung = Number(item.daDung || 0);
                  const tonKho = Number(item.soLuongTon || 0);
                  const giaNhap = Number(item.giaNhap || 0);
                  const tyLeTon =
                    nhapVao > 0 ? Math.round((tonKho / nhapVao) * 100) : 0;

                  return (
                    <tr key={item.id}>
                      <td>#{String(item.id).padStart(3, "0")}</td>
                      <td><strong>{item.tenSanPham || "Không có tên"}</strong></td>
                      <td>{item.danhMuc || "Khác"}</td>
                      <td>{nhapVao}</td>
                      <td>{daDung}</td>
                      <td>{tonKho}</td>
                      <td>{tyLeTon}%</td>
                      <td>{formatCurrency(giaNhap)}</td>
                      <td>
                        <span className={`status ${getTrangThaiClass(item.trangThai)}`}>
                          • {item.trangThai}
                        </span>
                      </td>
                      <td>
                        <div className="action_buttons">
                          <button
                            className="action_btn action_btn_edit"
                            title="Sửa"
                            onClick={() => openEditModal(item)}
                          >
                            ✏️
                          </button>

                          <button
                            className="action_btn action_btn_delete"
                            title="Xóa"
                            onClick={() => openDeleteModal(item)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center" }}>
                    Không có dữ liệu kho
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal_overlay" onClick={() => setShowModal(false)}>
          <div className="modal_box" onClick={(e) => e.stopPropagation()}>
            <div className="modal_header">
              <h3>{editingItem ? "Cập nhật kho" : "Nhập kho"}</h3>
              <button className="modal_close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal_body">
              <div className="form_group">
                <label>Tên sản phẩm</label>
                <input
                  className="form_input"
                  value={form.tenSanPham}
                  onChange={(e) =>
                    setForm({ ...form, tenSanPham: e.target.value })
                  }
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>

              <div className="form_group">
                <label>Danh mục</label>
                <select
                  className="form_select"
                  value={form.danhMucId}
                  onChange={(e) =>
                    setForm({ ...form, danhMucId: Number(e.target.value) })
                  }
                >
                  <option value={1}>Đồ ăn vặt</option>
                  <option value={2}>Đồ ăn đêm</option>
                  <option value={3}>Đồ uống</option>
                </select>
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Nhập vào</label>
                  <input
                    className="form_input"
                    type="number"
                    value={form.nhapVao}
                    onChange={(e) =>
                      setForm({ ...form, nhapVao: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form_group">
                  <label>Đã dùng</label>
                  <input
                    className="form_input"
                    type="number"
                    value={form.daDung}
                    onChange={(e) =>
                      setForm({ ...form, daDung: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Tồn kho</label>
                  <input
                    className="form_input"
                    type="number"
                    value={form.soLuongTon}
                    onChange={(e) =>
                      setForm({ ...form, soLuongTon: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form_group">
                  <label>Giá nhập</label>
                  <input
                    className="form_input"
                    type="number"
                    value={form.giaNhap}
                    onChange={(e) =>
                      setForm({ ...form, giaNhap: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form_group">
                <label>Vị trí kho</label>
                <input
                  className="form_input"
                  type="text"
                  value={form.viTriKho}
                  onChange={(e) =>
                    setForm({ ...form, viTriKho: e.target.value })
                  }
                  placeholder="Ví dụ: Kệ A1"
                />
              </div>
            </div>

            <div className="modal_footer">
              <button
                className="btn btn_secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Hủy
              </button>

              <button className="btn btn_primary" onClick={handleSave}>
                {editingItem ? "Cập nhật" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteItem && (
        <div className="modal_overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal_box" onClick={(e) => e.stopPropagation()}>
            <div className="modal_header">
              <h3>Xác nhận xóa</h3>
              <button
                className="modal_close"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal_body">
              <p className="confirm_text">
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <strong>{deleteItem.tenSanPham}</strong> khỏi kho không?
              </p>
            </div>

            <div className="modal_footer">
              <button
                className="btn btn_secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button className="btn btn_danger" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}