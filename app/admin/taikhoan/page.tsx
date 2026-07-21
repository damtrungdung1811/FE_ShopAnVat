"use client";

import { useEffect, useState } from "react";

interface TaiKhoan {
  id: number;
  username: string;
  password: string;
  hoTen: string;
  vaiTro: string;
  nhanVienId: number | null;
  trangThai: string;
  created_at: string;
}

const API_URL = "http://localhost:3001";

const emptyForm = {
  id: 0,
  username: "",
  password: "",
  hoTen: "",
  vaiTro: "nhanvien",
  nhanVienId: "",
  trangThai: "hoat_dong",
  created_at: "",
};

const getStatusClass = (s: string) =>
  s === "hoat_dong" ? "done" : "cancelled";

const getStatusText = (s: string) =>
  s === "hoat_dong" ? "Hoạt động" : "Khóa";

const getRoleText = (r: string) => {
  switch (r) {
    case "admin":
      return "Admin";
    case "nhanvien":
      return "Nhân viên";
    case "khachhang":
      return "Khách hàng";
    default:
      return r;
  }
};

const getRoleColor = (r: string) => {
  switch (r) {
    case "admin":
      return { background: "#fef2f2", color: "#dc2626" };
    case "nhanvien":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "khachhang":
      return { background: "#d1fae5", color: "#059669" };
    default:
      return { background: "#e5e7eb", color: "#374151" };
  }
};

export default function TaiKhoanPage() {
  const [list, setList] = useState<TaiKhoan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editItem, setEditItem] = useState<TaiKhoan | null>(null);
  const [deleteItem, setDeleteItem] = useState<TaiKhoan | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>(emptyForm);

  const fetchTaiKhoan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/taikhoan`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi lấy danh sách tài khoản");
        return;
      }

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi fetch tài khoản:", error);
      alert("Không kết nối được backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaiKhoan();
  }, []);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);

    try {
      if (!value.trim()) {
        fetchTaiKhoan();
        return;
      }

      const res = await fetch(
        `${API_URL}/taikhoan/timkiem?keyword=${encodeURIComponent(value)}`
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi tìm kiếm tài khoản");
        return;
      }

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Không thể tìm kiếm dữ liệu");
    }
  };

  const hoatDong = list.filter((tk) => tk.trangThai === "hoat_dong").length;
  const biKhoa = list.filter((tk) => tk.trangThai !== "hoat_dong").length;
  const adminCount = list.filter((tk) => tk.vaiTro === "admin").length;
  const khachHangCount = list.filter((tk) => tk.vaiTro === "khachhang").length;

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (tk: TaiKhoan) => {
    setEditItem(tk);
    setForm({
      id: tk.id,
      username: tk.username,
      password: tk.password,
      hoTen: tk.hoTen,
      vaiTro: tk.vaiTro,
      nhanVienId: tk.nhanVienId ?? "",
      trangThai: tk.trangThai,
      created_at: tk.created_at,
    });
    setShowModal(true);
  };

  const openDelete = (tk: TaiKhoan) => {
    setDeleteItem(tk);
    setShowDeleteModal(true);
  };

  const togglePassword = (id: number) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (!form.username.trim() || !form.password.trim() || !form.hoTen.trim()) {
      alert("Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu và họ tên");
      return;
    }

    const payload = {
      username: form.username,
      password: form.password,
      hoTen: form.hoTen,
      vaiTro: form.vaiTro,
      nhanVienId:
        form.nhanVienId === "" ? null : Number(form.nhanVienId),
      trangThai: form.trangThai,
    };

    try {
      let res: Response;

      if (editItem) {
        res = await fetch(`${API_URL}/taikhoan/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/taikhoan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lưu tài khoản thất bại");
        return;
      }

      alert(data.message || "Thành công");
      setShowModal(false);
      fetchTaiKhoan();
    } catch (error) {
      console.error("Lỗi lưu tài khoản:", error);
      alert("Không kết nối được backend");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`${API_URL}/taikhoan/${deleteItem.id}`, {
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
      fetchTaiKhoan();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      alert("Không kết nối được backend");
    }
  };

  return (
    <div>
      <div className="stats_row">
        <div className="stat_card">
          <div className="stat_icon blue">🔐</div>
          <div className="stat_info">
            <h3>{list.length}</h3>
            <p>Tổng tài khoản</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon green">✅</div>
          <div className="stat_info">
            <h3>{hoatDong}</h3>
            <p>Hoạt động</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon red">🔒</div>
          <div className="stat_info">
            <h3>{biKhoa}</h3>
            <p>Đã khóa</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon orange">👑</div>
          <div className="stat_info">
            <h3>{adminCount}</h3>
            <p>Admin</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon purple">👤</div>
          <div className="stat_info">
            <h3>{khachHangCount}</h3>
            <p>Khách hàng</p>
          </div>
        </div>
      </div>

      <div className="table_section">
        <div className="management_header">
          <h2>Quản lý tài khoản</h2>
          <div className="management_actions">
            <input
              type="text"
              className="search_input"
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="btn btn_primary" onClick={openAdd}>
              + Thêm tài khoản
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
                <th>Tài khoản</th>
                <th>Mật khẩu</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Nhân viên ID</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((tk) => (
                <tr key={tk.id}>
                  <td>#{tk.id.toString().padStart(3, "0")}</td>

                  <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="avatar">{tk.hoTen?.charAt(0) || "A"}</div>
                    <b>{tk.username}</b>
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <code
                        style={{
                          background: "#f1f5f9",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          letterSpacing: showPasswords[tk.id] ? "0" : "2px",
                        }}
                      >
                        {showPasswords[tk.id] ? tk.password : "••••••"}
                      </code>
                      <button
                        onClick={() => togglePassword(tk.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          padding: "2px",
                        }}
                        title={showPasswords[tk.id] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPasswords[tk.id] ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </td>

                  <td>{tk.hoTen}</td>

                  <td>
                    <span className="category_badge" style={getRoleColor(tk.vaiTro)}>
                      {getRoleText(tk.vaiTro)}
                    </span>
                  </td>

                  <td>{tk.nhanVienId ?? "-"}</td>

                  <td>
                    <span className={`status ${getStatusClass(tk.trangThai)}`}>
                      {getStatusText(tk.trangThai)}
                    </span>
                  </td>

                  <td>
                    {tk.created_at
                      ? new Date(tk.created_at).toLocaleDateString("vi-VN")
                      : ""}
                  </td>

                  <td>
                    <div className="action_buttons">
                      <button
                        className="action_btn action_btn_edit"
                        title="Sửa"
                        onClick={() => openEdit(tk)}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action_btn action_btn_delete"
                        title="Xóa"
                        onClick={() => openDelete(tk)}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center" }}>
                    Không có dữ liệu tài khoản
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
              <h3>{editItem ? "Sửa tài khoản" : "Thêm tài khoản mới"}</h3>
              <button className="modal_close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal_body">
              <div className="form_row">
                <div className="form_group">
                  <label>Tên đăng nhập</label>
                  <input
                    className="form_input"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    placeholder="vd: admin"
                  />
                </div>

                <div className="form_group">
                  <label>Mật khẩu</label>
                  <input
                    className="form_input"
                    type="text"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Nhập mật khẩu..."
                  />
                </div>
              </div>

              <div className="form_group">
                <label>Họ tên</label>
                <input
                  className="form_input"
                  value={form.hoTen}
                  onChange={(e) =>
                    setForm({ ...form, hoTen: e.target.value })
                  }
                  placeholder="Nhập họ tên..."
                />
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Vai trò</label>
                  <select
                    className="form_select"
                    value={form.vaiTro}
                    onChange={(e) =>
                      setForm({ ...form, vaiTro: e.target.value })
                    }
                  >
                    <option value="khachhang">Khách hàng</option>
                    <option value="nhanvien">Nhân viên</option>
                    <option value="admin">Admin</option>
                  </select>
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
                    <option value="hoat_dong">Hoạt động</option>
                    <option value="khoa">Khóa</option>
                  </select>
                </div>
              </div>

              <div className="form_group">
                <label>Nhân viên ID</label>
                <input
                  className="form_input"
                  type="number"
                  value={form.nhanVienId}
                  onChange={(e) =>
                    setForm({ ...form, nhanVienId: e.target.value })
                  }
                  placeholder="Để trống nếu không có"
                />
              </div>
            </div>

            <div className="modal_footer">
              <button className="btn btn_secondary" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="btn btn_primary" onClick={handleSave}>
                {editItem ? "Cập nhật" : "Tạo tài khoản"}
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
              <button className="modal_close" onClick={() => setShowDeleteModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal_body">
              <div className="confirm_icon">🗑️</div>
              <p className="confirm_text">
                Bạn có chắc chắn muốn xóa tài khoản <b>{deleteItem.username}</b> ({deleteItem.hoTen})?
                <br />
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal_footer">
              <button className="btn btn_secondary" onClick={() => setShowDeleteModal(false)}>
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