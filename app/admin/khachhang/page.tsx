"use client";

import { useEffect, useState } from "react";

interface KhachHang {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email?: string | null;
  diaChi?: string | null;
  created_at?: string;
}

const emptyForm: KhachHang = {
  id: 0,
  hoTen: "",
  soDienThoai: "",
  email: "",
  diaChi: "",
};

const API_URL = "http://localhost:3001";

export default function KhachHangPage() {
  const [list, setList] = useState<KhachHang[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editItem, setEditItem] = useState<KhachHang | null>(null);
  const [deleteItem, setDeleteItem] = useState<KhachHang | null>(null);
  const [form, setForm] = useState<KhachHang>(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchKhachHang = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/khachhang`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi lấy khách hàng");
        return;
      }

      setList(data);
    } catch (error) {
      console.error("Lỗi API:", error);
      alert("Không kết nối được backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhachHang();
  }, []);

  const handleSearch = async (keyword: string) => {
    setSearchTerm(keyword);

    try {
      if (!keyword.trim()) {
        fetchKhachHang();
        return;
      }

      const res = await fetch(
        `${API_URL}/khachhang/timkiem?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi tìm kiếm khách hàng");
        return;
      }

      setList(data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Không tìm kiếm được khách hàng");
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (kh: KhachHang) => {
    setEditItem(kh);
    setForm({
      id: kh.id,
      hoTen: kh.hoTen,
      soDienThoai: kh.soDienThoai,
      email: kh.email ?? "",
      diaChi: kh.diaChi ?? "",
    });
    setShowModal(true);
  };

  const openDelete = (kh: KhachHang) => {
    setDeleteItem(kh);
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    if (!form.hoTen.trim() || !form.soDienThoai.trim()) {
      alert("Vui lòng nhập họ tên và số điện thoại");
      return;
    }

    try {
      const payload = {
        hoTen: form.hoTen,
        soDienThoai: form.soDienThoai,
        email: form.email,
        diaChi: form.diaChi,
      };

      let res: Response;

      if (editItem) {
        res = await fetch(`${API_URL}/khachhang/${editItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/khachhang`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lưu khách hàng thất bại");
        return;
      }

      alert(data.message || "Thành công");
      setShowModal(false);
      setForm(emptyForm);
      setEditItem(null);
      fetchKhachHang();
    } catch (error) {
      console.error("Lỗi lưu khách hàng:", error);
      alert("Không kết nối được backend");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`${API_URL}/khachhang/${deleteItem.id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        const errMsg = data.message || data.error || "Xóa thất bại";
        if (errMsg.toLowerCase().includes("foreign key") || errMsg.toLowerCase().includes("constraint") || errMsg.toLowerCase().includes("donhang")) {
          alert("❌ Không thể xóa khách hàng này vì họ đang có đơn hàng liên kết. Hãy xóa đơn hàng trước!");
        } else {
          alert("❌ " + errMsg);
        }
        return;
      }

      alert("✅ " + (data.message || "Xóa khách hàng thành công!"));
      setShowDeleteModal(false);
      setDeleteItem(null);
      fetchKhachHang();
    } catch (error) {
      console.error("Lỗi xóa khách hàng:", error);
      alert("❌ Không kết nối được backend. Vui lòng thử lại!");
    }
  };

  return (
    <div>
      <div className="stats_row">
        <div className="stat_card">
          <div className="stat_icon blue">👥</div>
          <div className="stat_info">
            <h3>{list.length}</h3>
            <p>Tổng khách hàng</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon green">📞</div>
          <div className="stat_info">
            <h3>{list.filter((kh) => !!kh.soDienThoai).length}</h3>
            <p>Có số điện thoại</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon purple">📧</div>
          <div className="stat_info">
            <h3>{list.filter((kh) => !!kh.email).length}</h3>
            <p>Có email</p>
          </div>
        </div>
      </div>

      <div className="table_section">
        <div className="management_header">
          <h2>Quản lý khách hàng</h2>
          <div className="management_actions">
            <input
              type="text"
              className="search_input"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="btn btn_primary" onClick={openAdd}>
              + Thêm khách hàng
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
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((kh) => (
                <tr key={kh.id}>
                  <td>#{kh.id.toString().padStart(3, "0")}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="avatar">{kh.hoTen.charAt(0)}</div>
                    {kh.hoTen}
                  </td>
                  <td>{kh.soDienThoai}</td>
                  <td>{kh.email || "-"}</td>
                  <td>{kh.diaChi || "-"}</td>
                  <td>
                    <div className="action_buttons">
                      <button
                        className="action_btn action_btn_edit"
                        title="Sửa"
                        onClick={() => openEdit(kh)}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action_btn action_btn_delete"
                        title="Xóa"
                        onClick={() => openDelete(kh)}
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
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    Không có khách hàng nào
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
              <h3>{editItem ? "Sửa khách hàng" : "Thêm khách hàng mới"}</h3>
              <button className="modal_close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal_body">
              <div className="form_group">
                <label>Họ tên</label>
                <input
                  className="form_input"
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                  placeholder="Nhập họ tên..."
                />
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Số điện thoại</label>
                  <input
                    className="form_input"
                    value={form.soDienThoai}
                    onChange={(e) =>
                      setForm({ ...form, soDienThoai: e.target.value })
                    }
                    placeholder="0901234567"
                  />
                </div>

                <div className="form_group">
                  <label>Email</label>
                  <input
                    className="form_input"
                    value={form.email ?? ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@gmail.com"
                  />
                </div>
              </div>

              <div className="form_group">
                <label>Địa chỉ</label>
                <input
                  className="form_input"
                  value={form.diaChi ?? ""}
                  onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                  placeholder="Nhập địa chỉ..."
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
                {editItem ? "Cập nhật" : "Thêm mới"}
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
                Bạn có chắc chắn muốn xóa khách hàng <b>{deleteItem.hoTen}</b>?
                <br />
                Hành động này không thể hoàn tác.
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