"use client";

import { useEffect, useState } from "react";

interface SanPham {
  id: number;
  tenSanPham: string;
  giaCu: number;
  giaMoi: number;
  giamGia: string | number | null;
  hinhAnh: string | null;
  moTa: string | null;
  trangThai: string;
  danhMucId: number;
  danhMuc?: string;
  created_at?: string;
  updated_at?: string;
}

const API_URL = "http://localhost:3001";

const emptyForm = {
  tenSanPham: "",
  giaCu: 0,
  giaMoi: 0,
  giamGia: "",
  hinhAnh: "",
  moTa: "",
  trangThai: "con_hang",
  danhMucId: 1,
};

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

const getDanhMucText = (id: number) => {
  switch (Number(id)) {
    case 1:
      return "Đồ ăn vặt";
    case 2:
      return "Đồ ăn đêm";
    case 3:
      return "Đồ uống";
    default:
      return "Khác";
  }
};

const getStatusText = (s: string) => {
  switch (s) {
    case "con_hang":
      return "Còn hàng";
    case "ngung_ban":
      return "Ngừng bán";
    default:
      return s;
  }
};

const getStatusClass = (s: string) => {
  switch (s) {
    case "con_hang":
      return "done";
    case "ngung_ban":
      return "cancelled";
    default:
      return "";
  }
};

export default function SanPhamPage() {
  const [list, setList] = useState<SanPham[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SanPham | null>(null);
  const [deleteItem, setDeleteItem] = useState<SanPham | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const fetchSanPham = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/sanpham`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi lấy sản phẩm");
        return;
      }

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi fetch sản phẩm:", error);
      alert("Không kết nối được backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSanPham();
  }, []);

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);

    try {
      if (!keyword.trim()) {
        fetchSanPham();
        return;
      }

      const res = await fetch(
        `${API_URL}/sanpham/timkiem?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi tìm kiếm sản phẩm");
        return;
      }

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Không thể tìm kiếm dữ liệu");
    }
  };

  const tongSanPham = list.length;
  const conHang = list.filter((sp) => sp.trangThai === "con_hang").length;
  const ngungBan = list.filter((sp) => sp.trangThai === "ngung_ban").length;
  const doAnVat = list.filter((sp) => Number(sp.danhMucId) === 1).length;
  const doUong = list.filter((sp) => Number(sp.danhMucId) === 3).length;

  const openAddModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item: SanPham) => {
    setEditingItem(item);
    setForm({
      tenSanPham: item.tenSanPham || "",
      giaCu: Number(item.giaCu || 0),
      giaMoi: Number(item.giaMoi || 0),
      giamGia: item.giamGia ?? "",
      hinhAnh: item.hinhAnh ?? "",
      moTa: item.moTa ?? "",
      trangThai: item.trangThai || "con_hang",
      danhMucId: Number(item.danhMucId || 1),
    });
    setShowModal(true);
  };

  const openDeleteModal = (item: SanPham) => {
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

    if (Number(form.giaMoi) < 0) {
      alert("Giá mới không hợp lệ");
      return;
    }

    const payload = {
      tenSanPham: form.tenSanPham.trim(),
      giaCu: Number(form.giaCu || 0),
      giaMoi: Number(form.giaMoi || 0),
      giamGia: form.giamGia === "" ? null : form.giamGia,
      hinhAnh: form.hinhAnh || null,
      moTa: form.moTa || null,
      trangThai: form.trangThai,
      danhMucId: Number(form.danhMucId),
    };

    try {
      let res: Response;

      if (editingItem) {
        res = await fetch(`${API_URL}/sanpham/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/sanpham`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lưu sản phẩm thất bại");
        return;
      }

      alert(data.message || "Thành công");
      setShowModal(false);
      resetForm();
      fetchSanPham();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      alert("Không kết nối được backend");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`${API_URL}/sanpham/${deleteItem.id}`, {
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
      fetchSanPham();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      alert("Không kết nối được backend");
    }
  };

  return (
    <div>
      <div className="stats_row">
        <div className="stat_card">
          <div className="stat_icon blue">🍟</div>
          <div className="stat_info">
            <h3>{tongSanPham}</h3>
            <p>Tổng sản phẩm</p>
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
          <div className="stat_icon red">⛔</div>
          <div className="stat_info">
            <h3>{ngungBan}</h3>
            <p>Ngừng bán</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon orange">🍿</div>
          <div className="stat_info">
            <h3>{doAnVat}</h3>
            <p>Đồ ăn vặt</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon purple">🥤</div>
          <div className="stat_info">
            <h3>{doUong}</h3>
            <p>Đồ uống</p>
          </div>
        </div>
      </div>

      <div className="table_section">
        <div className="management_header">
          <h2>Quản lý sản phẩm</h2>

          <div className="management_actions">
            <input
              type="text"
              className="search_input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <button className="btn btn_primary" onClick={openAddModal}>
              + Thêm sản phẩm
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
                <th>GIÁ CŨ</th>
                <th>GIÁ MỚI</th>
                <th>GIẢM GIÁ</th>
                <th>TRẠNG THÁI</th>
                <th>CẬP NHẬT</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>

            <tbody>
              {list.length > 0 ? (
                list.map((item) => (
                  <tr key={item.id}>
                    <td>#{String(item.id).padStart(3, "0")}</td>
                    <td>
                      <div>
                        <strong>{item.tenSanPham || "Không có tên"}</strong>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                          {item.moTa || "-"}
                        </div>
                      </div>
                    </td>
                    <td>{item.danhMuc || getDanhMucText(item.danhMucId)}</td>
                    <td>{formatCurrency(item.giaCu)}</td>
                    <td><strong>{formatCurrency(item.giaMoi)}</strong></td>
                    <td>{item.giamGia ?? "-"}</td>
                    <td>
                      <span className={`status ${getStatusClass(item.trangThai)}`}>
                        {getStatusText(item.trangThai)}
                      </span>
                    </td>
                    <td>
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleString("vi-VN")
                        : ""}
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
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center" }}>
                    Không có dữ liệu sản phẩm
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
              <h3>{editingItem ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h3>
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

              <div className="form_row">
                <div className="form_group">
                  <label>Giá cũ</label>
                  <input
                    className="form_input"
                    type="number"
                    value={form.giaCu}
                    onChange={(e) =>
                      setForm({ ...form, giaCu: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form_group">
                  <label>Giá mới</label>
                  <input
                    className="form_input"
                    type="number"
                    value={form.giaMoi}
                    onChange={(e) =>
                      setForm({ ...form, giaMoi: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Giảm giá</label>
                  <input
                    className="form_input"
                    value={form.giamGia}
                    onChange={(e) =>
                      setForm({ ...form, giamGia: e.target.value })
                    }
                    placeholder="-10.00% hoặc để trống"
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
              </div>

              <div className="form_group">
                <label>Hình ảnh</label>
                <input
                  className="form_input"
                  value={form.hinhAnh}
                  onChange={(e) =>
                    setForm({ ...form, hinhAnh: e.target.value })
                  }
                  placeholder="/images/ten-anh.png"
                />
              </div>

              <div className="form_group">
                <label>Mô tả</label>
                <textarea
                  className="form_textarea"
                  value={form.moTa}
                  onChange={(e) =>
                    setForm({ ...form, moTa: e.target.value })
                  }
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </div>

              <div className="form_group">
                <label>Trạng thái</label>
                <select
                  className="form_select"
                  value={form.trangThai}
                  onChange={(e) =>
                    setForm({ ...form, trangThai: e.target.value })
                  }
                >
                  <option value="con_hang">Còn hàng</option>
                  <option value="ngung_ban">Ngừng bán</option>
                </select>
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
                {editingItem ? "Cập nhật" : "Thêm mới"}
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
                <strong>{deleteItem.tenSanPham}</strong> không?
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