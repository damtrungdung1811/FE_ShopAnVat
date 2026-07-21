"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);

      const khachHangId = parsedUser.khachHangId || parsedUser.id;

      if (!khachHangId) {
        setError("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại!");
        setLoading(false);
        return;
      }

      fetchMyOrders(Number(khachHangId));
    } catch (e) {
      console.error("Lỗi parse user:", e);
      router.push("/login");
    }
  }, [router]);

  const fetchMyOrders = async (khachHangId: number) => {
    try {
      const res = await fetch(
        `http://localhost:3001/donhang/my-orders?khachHangId=${khachHangId}`
      );

      if (!res.ok) throw new Error("Không thể kết nối đến server");

      const data = await res.json();

      const groups: Record<string, any> = {};
      const individuals: any[] = [];

      data.forEach((order: any) => {
        // Parse ghiChu an toàn
        let parsedNote: any = null;
        try {
          if (order.ghiChu) parsedNote = JSON.parse(order.ghiChu);
        } catch {}

        const groupId = parsedNote?.group;
        // Lấy đúng phần ghi chú của người dùng nhập (trường "note")
        const noteText = parsedNote?.note || (!parsedNote ? order.ghiChu : "") || "Không có ghi chú";

        if (groupId) {
          if (!groups[groupId]) {
            groups[groupId] = {
              ...order,
              isGroup: true,
              groupId,
              sanPhamList: [`${order.tenSanPham} (x${order.soLuong || 1})`],
              tongSoLuong: Number(order.soLuong || 0),
              tongTien: Number(order.tongTien || 0),
              ghiChuText: noteText,
              khachHangXacNhan: order.khachHangXacNhan || false,
            };
          } else {
            groups[groupId].sanPhamList.push(
              `${order.tenSanPham} (x${order.soLuong || 1})`
            );
            groups[groupId].tongSoLuong += Number(order.soLuong || 0);
            groups[groupId].tongTien += Number(order.tongTien || 0);
            // Nếu bất kỳ đơn nào trong nhóm đã xác nhận → cả nhóm đã xác nhận
            if (order.khachHangXacNhan) groups[groupId].khachHangXacNhan = true;
          }
        } else {
          individuals.push({
            ...order,
            isGroup: false,
            sanPhamList: [
              `${order.tenSanPham || `Sản phẩm #${order.sanPhamId}`} (x${order.soLuong || 1})`,
            ],
            tongSoLuong: Number(order.soLuong || 0),
            tongTien: Number(order.tongTien || 0),
            ghiChuText: noteText,
            khachHangXacNhan: order.khachHangXacNhan || false,
          });
        }
      });

      const mergedOrders = [...Object.values(groups), ...individuals];
      mergedOrders.sort((a, b) => b.id - a.id);

      setOrders(mergedOrders);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Khách hàng xác nhận đã nhận hàng → cập nhật trường khachHangXacNhan = true
  const handleConfirmReceived = async (order: any) => {
    setConfirmingId(order.id);
    try {
      const khachHangId = user?.khachHangId || user?.id;
      let idsToUpdate: number[] = [order.id];

      // Nếu là đơn nhóm, lấy tất cả id trong nhóm
      if (order.isGroup && order.groupId) {
        const res = await fetch(
          `http://localhost:3001/donhang/my-orders?khachHangId=${khachHangId}`
        );
        const rawData = await res.json();
        idsToUpdate = rawData
          .filter((o: any) => {
            try {
              const note = JSON.parse(o.ghiChu || "{}");
              return note?.group === order.groupId;
            } catch {
              return false;
            }
          })
          .map((o: any) => Number(o.id));
      }

      let successCount = 0;
      for (const id of idsToUpdate) {
        const res = await fetch(`http://localhost:3001/donhang/${id}/xacnhan`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) successCount++;
      }

      if (successCount > 0) {
        setSuccessMsg("🎉 Bạn đã xác nhận nhận hàng thành công!");
        setTimeout(() => setSuccessMsg(""), 4000);
        if (khachHangId) fetchMyOrders(Number(khachHangId));
      } else {
        alert("Xác nhận thất bại. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi xác nhận:", err);
      alert("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "hoan_thanh": return "✅ Đã đến nơi";
      case "dang_giao":  return "🚚 Đang giao";
      case "dang_xu_ly": return "⏳ Chưa giao";
      case "da_huy":     return "❌ Đã hủy";
      default:           return "⏳ Chưa giao";
    }
  };

  const formatPrice = (price: number | string) =>
    Number(price || 0).toLocaleString("vi-VN") + "đ";

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>⏳ Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", padding: "60px" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", minHeight: "70vh" }}>
      <h1 style={{ color: "var(--primary-color)", borderBottom: "3px solid #eee", paddingBottom: "15px", marginBottom: "30px" }}>
        📦 Đơn Hàng Của Tôi
      </h1>

      {/* Toast thông báo */}
      {successMsg && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          color: "white",
          padding: "16px 24px",
          borderRadius: "14px",
          fontWeight: 600,
          fontSize: "1rem",
          boxShadow: "0 8px 30px rgba(22,163,74,0.4)",
          zIndex: 9999,
          animation: "slideIn 0.35s ease",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          {successMsg}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(80px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .order-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 24px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .order-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .order-card.done    { border-left: 5px solid #16a34a; }
        .order-card.pending { border-left: 5px solid #f59e0b; }
        .order-card.delivering { border-left: 5px solid #1a73e8; }
        .order-card.cancelled  { border-left: 5px solid #ef4444; }

        .confirm-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(22,163,74,0.3);
          letter-spacing: 0.01em;
        }
        .confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(22,163,74,0.45);
        }
        .confirm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#f9f9f9", borderRadius: "12px" }}>
          <p style={{ fontSize: "1.3rem", color: "#666", marginBottom: "25px" }}>
            Bạn chưa có đơn hàng nào.
          </p>
          <Link href="/home" style={{
            background: "var(--primary-color)", color: "white",
            padding: "12px 28px", borderRadius: "8px",
            textDecoration: "none", fontWeight: "500"
          }}>
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {orders.map((order) => {
            const statusClass =
              order.trangThai === "hoan_thanh" ? "done" :
              order.trangThai === "dang_giao"  ? "delivering" :
              order.trangThai === "da_huy"     ? "cancelled" : "pending";

            // Hiện nút xác nhận khi admin đã đặt "hoan_thanh" và khách chưa xác nhận
            const canConfirm =
              order.trangThai === "hoan_thanh" && !order.khachHangXacNhan;
            const alreadyConfirmed =
              order.trangThai === "hoan_thanh" && order.khachHangXacNhan;

            return (
              <div key={order.id} className={`order-card ${statusClass}`}>
                {/* Header */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", flexWrap: "wrap",
                  gap: "15px", marginBottom: "20px"
                }}>
                  <div>
                    <strong style={{ fontSize: "1.25rem" }}>
                      Mã đơn: #{order.isGroup
                        ? `G-${String(order.id).padStart(4, "0")}`
                        : String(order.id).padStart(4, "0")}
                    </strong>
                    <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>
                      Ngày đặt: {order.ngayDat
                        ? String(order.ngayDat).slice(0, 10)
                        : "Không rõ"}
                    </div>
                  </div>

                  <div style={{
                    padding: "8px 18px",
                    borderRadius: "30px",
                    fontWeight: 600,
                    background:
                      order.trangThai === "hoan_thanh" ? "#e6f4ea" :
                      order.trangThai === "da_huy"     ? "#fce8e6" :
                      order.trangThai === "dang_giao"  ? "#e8f0fe" : "#fef7e0",
                    color:
                      order.trangThai === "hoan_thanh" ? "#137333" :
                      order.trangThai === "da_huy"     ? "#c5221f" :
                      order.trangThai === "dang_giao"  ? "#1a73e8" : "#b06000",
                  }}>
                    {getStatusText(order.trangThai)}
                  </div>
                </div>

                {/* Sản phẩm */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#333" }}>Danh sách sản phẩm:</h4>
                  <div style={{
                    background: "#f8f9fa", padding: "14px 16px",
                    borderRadius: "8px", lineHeight: "1.8", color: "#444"
                  }}>
                    {order.sanPhamList?.join(", ") || order.tenSanPham}
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px dashed #ddd",
                  paddingTop: "16px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}>
                  <div>
                    <span style={{ color: "#888", fontSize: "0.9rem" }}>Ghi chú: </span>
                    <i style={{ color: "#555" }}>
                      {order.ghiChuText && order.ghiChuText !== "Không có ghi chú"
                        ? order.ghiChuText
                        : "Không có ghi chú"}
                    </i>
                  </div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 600 }}>
                    Tổng tiền:&nbsp;
                    <span style={{ color: "var(--primary-color)" }}>
                      {formatPrice(order.tongTien)}
                    </span>
                  </div>
                </div>

                {/* -------- Banner xác nhận nhận hàng -------- */}
                {canConfirm && (
                  <div style={{
                    marginTop: "18px",
                    padding: "16px 20px",
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "1px solid #bbf7d0",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "2rem" }}>📦</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: "#15803d", fontSize: "0.97rem" }}>
                          Hàng đã đến nơi — bạn đã nhận được chưa?
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "#555" }}>
                          Nhấn xác nhận để thông báo cho chúng tôi biết.
                        </p>
                      </div>
                    </div>
                    <button
                      className="confirm-btn"
                      onClick={() => handleConfirmReceived(order)}
                      disabled={confirmingId === order.id}
                    >
                      {confirmingId === order.id
                        ? "⏳ Đang xử lý..."
                        : "✅ Xác nhận đã nhận hàng"}
                    </button>
                  </div>
                )}

                {/* Đã xác nhận rồi */}
                {alreadyConfirmed && (
                  <div style={{
                    marginTop: "16px",
                    padding: "13px 18px",
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "1px solid #86efac",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#166534",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                  }}>
                    <span style={{ fontSize: "1.3rem" }}>🎉</span>
                    Bạn đã xác nhận nhận hàng thành công. Cảm ơn bạn đã mua sắm!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}