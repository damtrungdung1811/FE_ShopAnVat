"use client";

import { useEffect, useState } from "react";

interface NhanVien {
  id: number;
  hoTen: string;
  soDienThoai: string;
  chucVu: string;
  ngayVaoLam: string;
  trangThai: string;
}

const emptyForm: NhanVien = {
  id: 0,
  hoTen: "",
  soDienThoai: "",
  chucVu: "Phục vụ",
  ngayVaoLam: "",
  trangThai: "Đang làm",
};

const API_URL = "http://localhost:3001";

const getStatusClass = (s: string) => {
  switch (s) {
    case "Đang làm":
      return "done";
    case "Nghỉ phép":
      return "pending";
    case "Đã nghỉ":
      return "cancelled";
    default:
      return "";
  }
};

const getChucVuColor = (c: string) => {
  switch (c) {
    case "Quản lý":
      return { background: "#fce7f3", color: "#be185d" };
    case "Pha chế":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "Thu ngân":
      return { background: "#d1fae5", color: "#065f46" };
    case "Phục vụ":
      return { background: "#ffedd5", color: "#c2410c" };
    default:
      return { background: "#e0f2fe", color: "#0369a1" };
  }
};

const formatDateInput = (value: string) => {
  if (!value) return "";
  return value.slice(0, 10);
};

const formatDateView = (value: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("vi-VN");
};

export default function NhanVienPage() {
  const [list, setList] = useState<NhanVien[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editItem, setEditItem] = useState<NhanVien | null>(null);
  const [deleteItem, setDeleteItem] = useState<NhanVien | null>(null);
  const [form, setForm] = useState<NhanVien>(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchNhanVien = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/nhanvien`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi lấy nhân viên");
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
    fetchNhanVien();
  }, []);

  const handleSearch = async (keyword: string) => {
    setSearchTerm(keyword);

    try {
      if (!keyword.trim()) {
        fetchNhanVien();
        return;
      }

      const res = await fetch(
        `${API_URL}/nhanvien/timkiem?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lỗi tìm kiếm nhân viên");
        return;
      }

      setList(data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Không tìm kiếm được nhân viên");
    }
  };

  const dangLam = list.filter((nv) => nv.trangThai === "Đang làm").length;
  const nghiPhep = list.filter((nv) => nv.trangThai === "Nghỉ phép").length;
  const daNghi = list.filter((nv) => nv.trangThai === "Đã nghỉ").length;

  const openAdd = () => {
    setEditItem(null);
    setForm({
      ...emptyForm,
      ngayVaoLam: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const openEdit = (nv: NhanVien) => {
    setEditItem(nv);
    setForm({
      id: nv.id,
      hoTen: nv.hoTen,
      soDienThoai: nv.soDienThoai,
      chucVu: nv.chucVu,
      ngayVaoLam: formatDateInput(nv.ngayVaoLam),
      trangThai: nv.trangThai,
    });
    setShowModal(true);
  };

  const openDelete = (nv: NhanVien) => {
    setDeleteItem(nv);
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
        chucVu: form.chucVu,
        ngayVaoLam: form.ngayVaoLam,
        trangThai: form.trangThai,
      };

      let res: Response;

      if (editItem) {
        res = await fetch(`${API_URL}/nhanvien/${editItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/nhanvien`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Lưu nhân viên thất bại");
        return;
      }

      alert(data.message || "Thành công");
      setShowModal(false);
      setForm(emptyForm);
      setEditItem(null);
      fetchNhanVien();
    } catch (error) {
      console.error("Lỗi lưu nhân viên:", error);
      alert("Không kết nối được backend");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`${API_URL}/nhanvien/${deleteItem.id}`, {
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
      fetchNhanVien();
    } catch (error) {
      console.error("Lỗi xóa nhân viên:", error);
      alert("Không kết nối được backend");
    }
  };

  return (
    <div>
      <div className="stats_row">
        <div className="stat_card">
          <div className="stat_icon blue">👨‍💼</div>
          <div className="stat_info">
            <h3>{list.length}</h3>
            <p>Tổng nhân viên</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon green">✅</div>
          <div className="stat_info">
            <h3>{dangLam}</h3>
            <p>Đang làm việc</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon orange">🏖️</div>
          <div className="stat_info">
            <h3>{nghiPhep}</h3>
            <p>Nghỉ phép</p>
          </div>
        </div>

        <div className="stat_card">
          <div className="stat_icon red">🚫</div>
          <div className="stat_info">
            <h3>{daNghi}</h3>
            <p>Đã nghỉ</p>
          </div>
        </div>
      </div>

      <div className="table_section">
        <div className="management_header">
          <h2>Quản lý nhân viên</h2>
          <div className="management_actions">
            <input
              type="text"
              className="search_input"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="btn btn_primary" onClick={openAdd}>
              + Thêm nhân viên
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
                <th>Nhân viên</th>
                <th>Số điện thoại</th>
                <th>Chức vụ</th>
                <th>Ngày vào làm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((nv) => (
                <tr key={nv.id}>
                  <td>#{nv.id.toString().padStart(3, "0")}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="avatar">{nv.hoTen.charAt(0)}</div>
                    {nv.hoTen}
                  </td>
                  <td>{nv.soDienThoai}</td>
                  <td>
                    <span className="category_badge" style={getChucVuColor(nv.chucVu)}>
                      {nv.chucVu}
                    </span>
                  </td>
                  <td>{formatDateView(nv.ngayVaoLam)}</td>
                  <td>
                    <span className={`status ${getStatusClass(nv.trangThai)}`}>
                      {nv.trangThai}
                    </span>
                  </td>
                  <td>
                    <div className="action_buttons">
                      <button
                        className="action_btn action_btn_edit"
                        title="Sửa"
                        onClick={() => openEdit(nv)}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action_btn action_btn_delete"
                        title="Xóa"
                        onClick={() => openDelete(nv)}
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
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    Không có nhân viên nào
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
              <h3>{editItem ? "Sửa nhân viên" : "Thêm nhân viên mới"}</h3>
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
                  <label>Chức vụ</label>
                  <select
                    className="form_select"
                    value={form.chucVu}
                    onChange={(e) => setForm({ ...form, chucVu: e.target.value })}
                  >
                    <option>Quản lý</option>
                    <option>Pha chế</option>
                    <option>Thu ngân</option>
                    <option>Phục vụ</option>
                  </select>
                </div>
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Ngày vào làm</label>
                  <input
                    className="form_input"
                    type="date"
                    value={formatDateInput(form.ngayVaoLam)}
                    onChange={(e) =>
                      setForm({ ...form, ngayVaoLam: e.target.value })
                    }
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
                    <option>Đang làm</option>
                    <option>Nghỉ phép</option>
                    <option>Đã nghỉ</option>
                  </select>
                </div>
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
                Bạn có chắc chắn muốn xóa nhân viên <b>{deleteItem.hoTen}</b>?
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