"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

const PROMO_CODE = "DungDepTrai";
const PROMO_DISCOUNT = 30000;
const PROMO_MIN_ORDER = 199000;

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    hoTen: "",
    soDienThoai: "",
    quanHuyen: "",
    diaChi: "",
    ghiChu: "",
    phuongThucThanhToan: "cod",
  });

  const [showQrModal, setShowQrModal] = useState(false);
  const [simulateAmount, setSimulateAmount] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  // Mã khuyến mãi
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoMsgType, setPromoMsgType] = useState<"success" | "error" | "">("");

  const danhSachQuanHuyen = [
    "Huyện Cát Hải", "Thành phố Thủy Nguyên", "Huyện Tiên Lãng",
    "Huyện Vĩnh Bảo", "Huyện An Lão", "Huyện Kiến Thụy",
    "Quận Hải An", "Quận An Dương", "Quận Dương Kinh",
    "Quận Đồ Sơn", "Quận Hồng Bàng", "Quận Kiến An",
    "Quận Lê Chân", "Quận Ngô Quyền"
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatPrice = (price: number | string) => {
    return Number(price).toLocaleString("vi-VN");
  };

  // Tính tổng sau giảm giá
  const rawTotal = getTotalPrice();
  const discount = promoApplied ? PROMO_DISCOUNT : 0;
  const finalTotal = Math.max(0, rawTotal - discount);

  // Áp dụng mã khuyến mãi
  const handleApplyPromo = () => {
    const code = promoInput.trim();
    if (!code) {
      setPromoMsg("Vui lòng nhập mã khuyến mãi!");
      setPromoMsgType("error");
      return;
    }
    if (code.toLowerCase() !== PROMO_CODE.toLowerCase()) {
      setPromoMsg("❌ Mã khuyến mãi không hợp lệ.");
      setPromoMsgType("error");
      setPromoApplied(false);
      return;
    }
    if (rawTotal < PROMO_MIN_ORDER) {
      setPromoMsg(`❌ Mã chỉ áp dụng cho đơn từ ${formatPrice(PROMO_MIN_ORDER)}đ.`);
      setPromoMsgType("error");
      setPromoApplied(false);
      return;
    }
    setPromoApplied(true);
    setPromoMsg(`✅ Áp dụng thành công! Giảm ${formatPrice(PROMO_DISCOUNT)}đ.`);
    setPromoMsgType("success");
  };

  // Hủy mã
  const handleRemovePromo = () => {
    setPromoApplied(false);
    setPromoInput("");
    setPromoMsg("");
    setPromoMsgType("");
  };

  // Validate số điện thoại: chỉ số, đúng 10 ký tự
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm({ ...form, soDienThoai: value });
  };

  const handleCheckoutClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }

    if (!form.hoTen || !form.soDienThoai || !form.quanHuyen || !form.diaChi) {
      alert("Vui lòng nhập đầy đủ Họ tên, Số điện thoại, Khu vực và Địa chỉ!");
      return;
    }

    if (form.soDienThoai.length !== 10) {
      alert("Số điện thoại phải đủ 10 chữ số!");
      return;
    }

    if (form.phuongThucThanhToan === "qr") {
      setShowQrModal(true);
      return;
    }

    executeCheckout();
  };

  const verifyMockPayment = () => {
    if (Number(simulateAmount) === finalTotal) {
      setPaymentMessage("✅ Đã trả đủ tiền!");
      setTimeout(() => {
        setShowQrModal(false);
        executeCheckout();
      }, 1500);
    } else if (Number(simulateAmount) > finalTotal) {
      setPaymentMessage("⚠️ Bạn đã chuyển dư số tiền!");
    } else {
      setPaymentMessage("❌ Số tiền chưa đủ, vui lòng kiểm tra lại!");
    }
  };

  const executeCheckout = async () => {

    // Lấy thông tin user đang đăng nhập
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Vui lòng đăng nhập trước khi đặt hàng!");
      router.push("/login");
      return;
    }

    let currentUser;
    try {
      currentUser = JSON.parse(userStr);
    } catch (e) {
      alert("Thông tin đăng nhập không hợp lệ!");
      return;
    }

    const khachHangId = currentUser.khachHangId || currentUser.id;
    if (!khachHangId) {
      alert("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại!");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const diaChiGiaoHang = `${form.diaChi}, ${form.quanHuyen}`;
      const today = new Date().toISOString().split("T")[0];
      const cartGroupId = Date.now().toString(36);

      // Nếu có giảm giá, phân bổ discount vào sản phẩm đầu tiên
      const discountNote = promoApplied
        ? ` [Mã KM: ${PROMO_CODE} -${formatPrice(PROMO_DISCOUNT)}đ]`
        : "";

      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        // Phân bổ discount vào item đầu tiên
        const itemDiscount = i === 0 && promoApplied ? PROMO_DISCOUNT : 0;
        const itemTotal = Math.max(0, item.giaMoi * item.soLuong - itemDiscount);

        const payload = {
          khachHangId: khachHangId,
          sanPhamId: item.sanPhamId,
          soLuong: item.soLuong,
          tongTien: itemTotal,
          trangThai: "dang_xu_ly",
          ngayDat: today,
          ghiChu: JSON.stringify({
            group: cartGroupId,
            user: currentUser.tenDangNhap || currentUser.username || "",
            note: form.ghiChu + (i === 0 ? discountNote : ""),
            hoTen: form.hoTen,
            soDienThoai: form.soDienThoai,
            diaChi: diaChiGiaoHang,
            phuongThuc: form.phuongThucThanhToan
          }),
        };

        const res = await fetch("http://localhost:3001/donhang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Lỗi tạo đơn cho ${item.tenSanPham}`);
        }
      }

      setSuccess(true);
      clearCart();

      setTimeout(() => {
        router.push("/home/donhang");
      }, 2000);

    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      alert(error.message || "Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Trang thành công
  if (success) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", minHeight: "70vh" }}>
        <h2 style={{ color: "#2e7d32", fontSize: "2.5rem", marginBottom: "20px" }}>
          🎉 Đặt hàng thành công!
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#555", marginBottom: "40px" }}>
          Cảm ơn bạn đã mua sắm tại Ăn Vặt 247.<br />
          Đơn hàng của bạn đang được xử lý và sẽ được giao sớm nhất.
        </p>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/home/donhang"
            style={{
              background: "#e63939",
              color: "white",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1.1rem"
            }}
          >
            Xem Đơn Hàng Của Tôi
          </Link>
          <Link
            href="/home"
            style={{
              background: "#333",
              color: "white",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1.1rem"
            }}
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // Giao diện giỏ hàng bình thường
  return (
    <>
      <link rel="stylesheet" href="/css/cart.css" />
      <div className="cart-page-container">
        <h1 className="cart-title">🛒 Giỏ Hàng Của Bạn</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Hiện chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link href="/home" className="login-btn">
              Quay lại mua sắm
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.hinhAnh} alt={item.tenSanPham} className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.tenSanPham}</div>
                    <div className="cart-item-price">{formatPrice(item.giaMoi)} đ</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.sanPhamId, item.soLuong - 1)} disabled={item.soLuong <= 1}>-</button>
                      <span className="qty-value">{item.soLuong}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.sanPhamId, item.soLuong + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.sanPhamId)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-box">
              <h3>Thông tin thanh toán</h3>

              {/* === TỔNG TIỀN + GIẢM GIÁ === */}
              <div style={{ marginBottom: "16px" }}>
                <div className="checkout-total" style={{ marginBottom: promoApplied ? "6px" : "0" }}>
                  <span>Tổng cộng:</span>
                  <span style={{ color: "#e63939", fontWeight: "bold" }}>{formatPrice(rawTotal)} đ</span>
                </div>
                {promoApplied && (
                  <>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "0.9rem", color: "#2e7d32", fontWeight: 600, marginBottom: "4px"
                    }}>
                      <span>🎁 Mã KM ({PROMO_CODE}):</span>
                      <span>-{formatPrice(PROMO_DISCOUNT)} đ</span>
                    </div>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "1.05rem", fontWeight: 700, borderTop: "1.5px dashed #ddd",
                      paddingTop: "8px", color: "#8b1a1a"
                    }}>
                      <span>Thành tiền:</span>
                      <span>{formatPrice(finalTotal)} đ</span>
                    </div>
                  </>
                )}
              </div>

              {/* === Ô NHẬP MÃ KHUYẾN MÃI === */}
              <div style={{
                background: "#fffbf0",
                border: "1.5px dashed #d4a017",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "18px"
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#7a5c00", marginBottom: "8px" }}>
                  🏷️ Mã khuyến mãi
                </div>
                {promoApplied ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{
                      background: "#e8f5e9", color: "#2e7d32",
                      padding: "6px 14px", borderRadius: "20px",
                      fontWeight: 700, fontSize: "0.9rem",
                      fontFamily: "monospace", letterSpacing: "1px"
                    }}>
                      ✅ {PROMO_CODE}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      style={{
                        background: "transparent", border: "1px solid #e63939",
                        color: "#e63939", borderRadius: "6px",
                        padding: "5px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600
                      }}
                    >
                      Hủy mã
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Nhập mã khuyến mãi..."
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoMsg("");
                        setPromoMsgType("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())}
                      style={{
                        flex: 1, padding: "8px 12px", border: "1.5px solid #ddd",
                        borderRadius: "8px", fontSize: "0.9rem",
                        fontFamily: "monospace", letterSpacing: "1px",
                        outline: "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      style={{
                        background: "#8b1a1a", color: "white", border: "none",
                        borderRadius: "8px", padding: "8px 16px",
                        cursor: "pointer", fontWeight: 700, fontSize: "0.87rem",
                        transition: "background 0.2s", whiteSpace: "nowrap"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#6b1010")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#8b1a1a")}
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
                {promoMsg && (
                  <div style={{
                    marginTop: "7px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: promoMsgType === "success" ? "#2e7d32" : "#c62828"
                  }}>
                    {promoMsg}
                  </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "6px" }}>
                  💡 Nhập <b style={{ color: "#8b1a1a", fontFamily: "monospace" }}>DungDepTrai</b> để giảm 30.000đ cho đơn từ 199.000đ
                </div>
              </div>

              <form className="checkout-form" onSubmit={handleCheckoutClick}>
                <div className="form-group">
                  <label>Họ và tên (*)</label>
                  <input
                    type="text"
                    placeholder="Nhập họ tên"
                    value={form.hoTen}
                    onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại (*)</label>
                  <input
                    type="tel"
                    placeholder="Nhập đủ 10 số điện thoại"
                    value={form.soDienThoai}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    pattern="\d{10}"
                    inputMode="numeric"
                    required
                    style={{
                      borderColor: form.soDienThoai.length > 0 && form.soDienThoai.length < 10
                        ? "#e63939" : undefined
                    }}
                  />
                  {form.soDienThoai.length > 0 && form.soDienThoai.length < 10 && (
                    <div style={{ fontSize: "0.78rem", color: "#e63939", marginTop: "4px", fontWeight: 500 }}>
                      ⚠️ Cần nhập đủ 10 chữ số ({form.soDienThoai.length}/10)
                    </div>
                  )}
                  {form.soDienThoai.length === 10 && (
                    <div style={{ fontSize: "0.78rem", color: "#2e7d32", marginTop: "4px", fontWeight: 500 }}>
                      ✅ Hợp lệ
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Khu vực giao hàng (*)</label>
                  <select value={form.quanHuyen} onChange={(e) => setForm({ ...form, quanHuyen: e.target.value })} required>
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {danhSachQuanHuyen.map((qh, idx) => <option key={idx} value={qh}>{qh}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Địa chỉ chi tiết (*)</label>
                  <input
                    type="text"
                    placeholder="Số nhà, ngõ, đường..."
                    value={form.diaChi}
                    onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ghi chú đơn hàng</label>
                  <textarea rows={3} placeholder="Ghi chú thêm..." value={form.ghiChu} onChange={(e) => setForm({ ...form, ghiChu: e.target.value })} />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>Phương thức thanh toán (*)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "normal" }}>
                      <input
                        type="radio"
                        name="phuongThuc"
                        value="cod"
                        checked={form.phuongThucThanhToan === "cod"}
                        onChange={(e) => setForm({ ...form, phuongThucThanhToan: e.target.value })}
                        style={{ width: "18px", height: "18px", accentColor: "#e63939" }}
                      />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "normal" }}>
                      <input
                        type="radio"
                        name="phuongThuc"
                        value="qr"
                        checked={form.phuongThucThanhToan === "qr"}
                        onChange={(e) => setForm({ ...form, phuongThucThanhToan: e.target.value })}
                        style={{ width: "18px", height: "18px", accentColor: "#e63939" }}
                      />
                      <span>Chuyển khoản (Quét mã VietQR)</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="checkout-btn" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : `ĐẶT HÀNG - ${formatPrice(finalTotal)}đ`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {showQrModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "white", padding: "30px", borderRadius: "16px",
            width: "100%", maxWidth: "400px", textAlign: "center", position: "relative"
          }}>
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: "absolute", top: "12px", right: "12px", background: "transparent",
                border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888"
              }}
            >&times;</button>
            <h2 style={{ fontSize: "1.3rem", color: "#1a1a1a", marginBottom: "16px" }}>Quét Mã Thanh Toán</h2>

            <div style={{ background: "#f8ecec", padding: "12px", borderRadius: "8px", marginBottom: "20px", display: "inline-block" }}>
              <img
                src={`https://img.vietqr.io/image/970422-0335345122-compact2.png?amount=${finalTotal}&addInfo=Thanh%20toan%20don%20hang&accountName=DAM%20TRUNG%20DUNG`}
                alt="QR Code"
                style={{ width: "200px", height: "200px", borderRadius: "8px" }}
              />
              <div style={{ marginTop: "10px", fontWeight: "bold", fontSize: "1.1rem" }}>
                ĐÀM TRUNG DŨNG
              </div>
              <div style={{ fontSize: "0.9rem", color: "#555" }}>
                Số tiền: <strong style={{ color: "#e63939" }}>{formatPrice(finalTotal)} đ</strong>
              </div>
            </div>

            <div style={{ textAlign: "left", marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
                Giả lập hệ thống (Nhập số tiền đã chuyển):
              </label>
              <input
                type="number"
                placeholder="Nhập số tiền..."
                value={simulateAmount}
                onChange={(e) => setSimulateAmount(e.target.value)}
                style={{
                  width: "100%", padding: "10px", border: "1.5px solid #ddd", borderRadius: "8px",
                  fontSize: "1rem"
                }}
              />
            </div>
            {paymentMessage && (
              <div style={{
                marginBottom: "16px", fontSize: "0.95rem", fontWeight: "bold",
                color: paymentMessage.includes("✅") ? "#2e7d32" : "#c62828"
              }}>
                {paymentMessage}
              </div>
            )}
            <button
              onClick={verifyMockPayment}
              style={{
                width: "100%", padding: "12px", background: "#e63939", color: "white",
                border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold",
                cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#c62828"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#e63939"}
            >
              Xác nhận đã chuyển tiền
            </button>
          </div>
        </div>
      )}
    </>
  );
}