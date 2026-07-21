"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

const bannerImages = ["/images/banner1.png", "/images/banner2.png", "/images/banner1.png"];

const bestSellers = [
  { name: "Mì trộn trứng cút", oldPrice: "12,000", newPrice: "10,000", img: "/images/noodle.png" },
  { name: "Sữa Chua Thạch Trân Châu", oldPrice: "", newPrice: "21,000", img: "/images/bubble_tea.png" },
  { name: "Khoai tây chiên bơ giòn", oldPrice: "25,000", newPrice: "23,000", img: "/images/fries.png" },
  { name: "Nước uống Coca", oldPrice: "", newPrice: "12,000", img: "/images/carrot_juice.png" },
  { name: "Gà sốt bla vla", oldPrice: "", newPrice: "12,000", img: "/images/carrot_juice.png" },

];

const newsItems = [
  {
    title: "10 món ăn vặt khoái khẩu mùa hè của teen Hà thành",
    desc: "Hoa quả dầm, caramen, sữa chua mít liên ngội mùa nắng nóng. Chè Chè trân...",
    img: "/images/news_food.png",
  },
  {
    title: "Các món ăn vặt vào mùa đông giá chỉ từ 10k",
    desc: "Cứ mỗi khi đông về là người ta luôn có cảm giác đói hơn...",
    img: "/images/banner1.png",
  },
  {
    title: "Những món ăn vặt tại Hà Nội vào mùa đông",
    desc: "Hà Nội đang bước vào những ngày mùa đông lạnh giá. Và những ngày mùa đông...",
    img: "/images/night_food.png",
  },
  {
    title: '21 món ăn mới lạ ở Hà Nội đảm bảo "no quên lối về"',
    desc: "Danh sách những món ăn vặt ngon Hà Nội bên dưới đây sẽ không làm...",
    img: "/images/banner2.png",
  },
];

const testimonials = [
  {
    name: "Chị Hương Văn Phòng",
    text: "Tôi thường xuyên đặt món ăn ở đây về ăn, đồ ăn rất ngon, không ngọt quá mà luôn giữ gìn được vị tươi ngon, tôi rất thích ăn và sẽ thường xuyên đặt...",
    avatar: "👩",
  },
  {
    name: "Anh Nam Kỹ Sư",
    text: "Mỗi khi tụ tập ăn đêm là chúng tôi lại gọi quán mang đồ ăn đêm đến, dịch vụ ship rất nhanh mà đồ lại tươi ngon, tôi thật sự hài lòng vì sự phục vụ...",
    avatar: "👨",
  },
];

interface Product {
  id: number;
  tenSanPham: string;
  giaCu: string | number;
  giaMoi: string | number;
  giamGia: string | null;
  hinhAnh: string;
  moTa: string;
  trangThai: string;
  danhMucId: number;
  tenDanhMuc?: string;
  soLuongTon?: number;
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [relatedScrollIdx, setRelatedScrollIdx] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3001/sanpham");

        if (res.ok) {
          console.log("✅ Kết nối API thành công");
          setMessage("✅ Kết nối API thành công");
        }

        const data: Product[] = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("❌ Lỗi kết nối API:", error);
        setMessage("❌ Kết nối API thất bại");
      }
    };

    fetchProducts();
  }, []);

  // Reset quantity & carousel khi mở sản phẩm mới
  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setRelatedScrollIdx(0);
    }
  }, [selectedProduct]);

  const snackProducts = products.filter(
    (item) => item.danhMucId === 1 && item.trangThai === "con_hang"
  );

  const nightFoodProducts = products.filter(
    (item) => item.danhMucId === 2 && item.trangThai === "con_hang"
  );

  const drinkProducts = products.filter(
    (item) => item.danhMucId === 3 && item.trangThai === "con_hang"
  );

  const formatPrice = (price: string | number) => {
    return Number(price).toLocaleString("vi-VN");
  };

  const getIngredients = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("khoai tây")) return ["🍟 Khoai tây sấy/chiên (150g)", "🧈 Bơ nhạt thơm (15g)", "🧂 Gia vị đặc biệt (Muối, tiêu 5g)", "🍅 Tương ớt/cà xốt (30ml)"];
    if (lowerName.includes("mì") || lowerName.includes("mỳ")) return ["🍜 Sợi mì dai ngon (120g)", "🥚 Trứng cút / Xúc xích (50g)", "🥦 Rau xanh tươi mát (30g)", "🍯 Nước sốt trộn gia truyền (40ml)"];
    if (lowerName.includes("gà")) return ["🍗 Thịt gà tươi rút xương (200g)", "🍞 Bột chiên giòn (30g)", "🌶️ Nước sốt đậm đà (40ml)", "🌱 Vừng rang thơm (5g)"];
    if (lowerName.includes("nem")) return ["🥩 Thịt heo nạc sạch (100g)", "🧅 Bì lợn thát lát (40g)", "🥖 Thính gạo / Bột chiên (20g)", "🔥 Tương ớt chấm cay (30ml)"];
    if (lowerName.includes("sữa chua")) return ["🥛 Sữa chua lên men tự nhiên (100g)", "🧋 Trân châu dai giòn (30g)", "🍬 Đường tinh luyện (10g)", "✨ Topping thạch sương sáo (20g)"];
    if (lowerName.includes("trà")) return ["🍵 Cốt trà đặc nguyên chất (150ml)", "🍬 Đường kính trắng (25g)", "🧋 Trân châu đen/trắng (40g)", "🧊 Đá lạnh tinh khiết (50g)"];
    if (lowerName.includes("coca") || lowerName.includes("nước")) return ["🥤 Nước giải khát (330ml)", "🍬 Lượng đường tiêu chuẩn (25g)", "🧊 Đá lạnh (50g)", "🍋 Lát chanh tươi (5g)"];
    
    return ["✨ Khẩu phần đặc chuẩn cho 1 người (Khoảng 350 kcal)", "🥩 Các nguyên liệu cốt lõi (150g)", "🧂 Gia vị / Sốt tẩm ướp (20g)", "🛡️ Đảm bảo vệ sinh an toàn 100%"];
  };

  return (
    <>
      {/* === BANNER MÃ GIẢM GIÁ === */}
      {showBanner && (
        <div style={{
          background: "linear-gradient(90deg, #8b1a1a 0%, #b22222 50%, #8b1a1a 100%)",
          color: "white",
          textAlign: "center",
          padding: "10px 40px",
          fontSize: "0.92rem",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 200,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <span style={{ marginRight: "10px" }}>&#127873;</span>
          NHẬP MÃ <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: "4px", fontFamily: "monospace", fontSize: "1rem", letterSpacing: "2px" }}>DungDepTrai</span> ĐỂ GIẢM 30K CHO ĐƠN TỪ 199K
          <span style={{ marginLeft: "10px" }}>&#127873;</span>
          <button
            onClick={() => setShowBanner(false)}
            style={{
              position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)",
              background: "transparent", border: "none", color: "rgba(255,255,255,0.7)",
              fontSize: "1.1rem", cursor: "pointer", padding: "4px 8px", lineHeight: 1,
              transition: "color 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "white")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          >&#x2715;</button>
        </div>
      )}
      <section className="banner-section">
        <div
          className="banner-slider"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {bannerImages.map((img, idx) => (
            <div className="banner-slide" key={idx}>
              <img src={img} alt={`Banner ${idx + 1}`} className="banner-img" />
            </div>
          ))}
        </div>

        <div className="banner-dots">
          {bannerImages.map((_, idx) => (
            <div
              key={idx}
              className={`banner-dot ${currentSlide === idx ? "active" : ""}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </section>

      <div className="service-bar">
        <div className="service-item">
          <div className="service-icon delivery">🛵</div>
          <span>Giao hàng siêu tốc</span>
        </div>
        <div className="service-item">
          <div className="service-icon consult">💬</div>
          <span>Tư vấn nhiệt tình</span>
        </div>
        <div className="service-item">
          <div className="service-icon payment">💳</div>
          <span>Thanh toán khi nhận hàng</span>
        </div>
      </div>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">DANH MỤC SẢN PHẨM</div>
            <ul className="category-list">
              <li>
                <Link href="/home/doanvat">
                  <span className="category-emoji">🍟</span> Đồ ăn vặt
                </Link>
              </li>
              <li>
                <Link href="/home/doandem">
                  <span className="category-emoji">🌙</span> Đồ ăn đêm
                </Link>
              </li>
              <li>
                <Link href="/home/douong">
                  <span className="category-emoji">🥤</span> Đồ uống
                </Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">SẢN PHẨM BÁN CHẠY</div>
            <div className="bestseller-list">
              {bestSellers.map((item, idx) => (
                <div className="bestseller-item" key={idx}>
                  <img src={item.img} alt={item.name} className="bestseller-img" />
                  <div className="bestseller-info">
                    <div className="bestseller-name">{item.name}</div>
                    {item.oldPrice && (
                      <span className="bestseller-price-old">{item.oldPrice} đ</span>
                    )}
                    <div className="bestseller-price-new">{item.newPrice} đ</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="content-area">
          {message && (
            <div style={{ color: message.includes("thành công") ? "green" : "red", marginBottom: "12px" }}>
              {message}
            </div>
          )}

          <h2 className="section-title">ĐỒ ĂN VẶT</h2>
          <div className="product-grid">
            {snackProducts.map((product) => (
              <div 
                className="product-card" 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
              >
                {product.giamGia && <div className="product-badge">{product.giamGia}</div>}

                <div className="product-img-wrapper">
                  <img
                    src={product.hinhAnh}
                    alt={product.tenSanPham}
                    className="product-img"
                  />
                </div>

                <div className="product-info">
                  <div className="product-name">{product.tenSanPham}</div>
                  <div className="product-prices">
                    {Number(product.giaCu) > 0 && (
                      <span className="price-old">{formatPrice(product.giaCu)} đ</span>
                    )}
                    <span className="price-new">{formatPrice(product.giaMoi)} đ</span>
                  </div>
                  {product.soLuongTon !== undefined && product.soLuongTon <= 0 ? (
                  <button 
                    className="add-to-cart-btn"
                    style={{ marginTop: "10px", width: "100%", padding: "8px", background: "#aaa", color: "white", border: "none", borderRadius: "6px", cursor: "not-allowed", fontWeight: "bold" }}
                    disabled
                  >
                    ❌ Hết hàng
                  </button>
                ) : (
                  <button
                    className="add-to-cart-btn"
                    style={{ marginTop: "10px", width: "100%", padding: "8px", background: "var(--primary)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: product.id,
                        sanPhamId: product.id,
                        tenSanPham: product.tenSanPham,
                        hinhAnh: product.hinhAnh,
                        giaMoi: Number(product.giaMoi) || 0
                      });
                      alert("Đã thêm vào giỏ hàng: " + product.tenSanPham);
                    }}
                  >
                    🛒 Thêm vào giỏ
                  </button>
                )}
                </div>
              </div>
            ))}
          </div>

          <h2 className="section-title">ĐỒ ĂN ĐÊM</h2>
          <div className="product-grid">
            {nightFoodProducts.map((product) => (
              <div 
                className="product-card" 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
              >
                {product.giamGia && <div className="product-badge">{product.giamGia}</div>}

                <div className="product-img-wrapper">
                  <img
                    src={product.hinhAnh}
                    alt={product.tenSanPham}
                    className="product-img"
                  />
                </div>

                <div className="product-info">
                  <div className="product-name">{product.tenSanPham}</div>
                  <div className="product-prices">
                    {Number(product.giaCu) > 0 && (
                      <span className="price-old">{formatPrice(product.giaCu)} đ</span>
                    )}
                    <span className="price-new">{formatPrice(product.giaMoi)} đ</span>
                  </div>
                  {product.soLuongTon !== undefined && product.soLuongTon <= 0 ? (
                  <button 
                    className="add-to-cart-btn"
                    style={{ marginTop: "10px", width: "100%", padding: "8px", background: "#aaa", color: "white", border: "none", borderRadius: "6px", cursor: "not-allowed", fontWeight: "bold" }}
                    disabled
                  >
                    ❌ Hết hàng
                  </button>
                ) : (
                  <button
                    className="add-to-cart-btn"
                    style={{ marginTop: "10px", width: "100%", padding: "8px", background: "var(--primary)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: product.id,
                        sanPhamId: product.id,
                        tenSanPham: product.tenSanPham,
                        hinhAnh: product.hinhAnh,
                        giaMoi: Number(product.giaMoi) || 0
                      });
                      alert("Đã thêm vào giỏ hàng: " + product.tenSanPham);
                    }}
                  >
                    🛒 Thêm vào giỏ
                  </button>
                )}
                </div>
              </div>
            ))}
          </div>

          <h2 className="section-title">ĐỒ UỐNG</h2>
          <div className="product-grid">
            {drinkProducts.map((product) => (
              <div 
                className="product-card" 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="product-img-wrapper">
                  <img
                    src={product.hinhAnh}
                    alt={product.tenSanPham}
                    className="product-img"
                  />
                </div>

                <div className="product-info">
                  <div className="product-name">{product.tenSanPham}</div>
                  <div className="product-prices">
                    <span className="price-new">{formatPrice(product.giaMoi)} đ</span>
                  </div>
                  {product.soLuongTon !== undefined && product.soLuongTon <= 0 ? (
                  <button 
                    className="add-to-cart-btn"
                    style={{ marginTop: "10px", width: "100%", padding: "8px", background: "#aaa", color: "white", border: "none", borderRadius: "6px", cursor: "not-allowed", fontWeight: "bold" }}
                    disabled
                  >
                    ❌ Hết hàng
                  </button>
                ) : (
                  <button
                    className="add-to-cart-btn"
                    style={{ marginTop: "10px", width: "100%", padding: "8px", background: "var(--primary)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: product.id,
                        sanPhamId: product.id,
                        tenSanPham: product.tenSanPham,
                        hinhAnh: product.hinhAnh,
                        giaMoi: Number(product.giaMoi) || 0
                      });
                      alert("Đã thêm vào giỏ hàng: " + product.tenSanPham);
                    }}
                  >
                    🛒 Thêm vào giỏ
                  </button>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="testimonials-section">
        <h2 className="testimonials-title">Ý KIẾN KHÁCH HÀNG</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div className="testimonial-card" key={idx}>
              <div
                style={{
                  fontSize: "3rem",
                  width: "70px",
                  height: "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f0e6d0",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              >
                {t.avatar}
              </div>
              <div className="testimonial-content">
                <h4>{t.name}</h4>
                <p>{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="news-section">
        <h2 className="news-title">TIN TỨC KHUYẾN MẠI</h2>
        <div className="news-grid">
          {newsItems.map((item, idx) => (
            <div className="news-card" key={idx}>
              <img src={item.img} alt={item.title} className="news-img" />
              <div className="news-card-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div
            className="product-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 0,
              maxWidth: "420px",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              position: "relative",
            }}
          >
            {/* Ảnh sản phẩm toàn chiều rộng */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={selectedProduct.hinhAnh}
                alt={selectedProduct.tenSanPham}
                style={{ width: "100%", height: "260px", objectFit: "cover", display: "block" }}
              />
              {/* Nút đóng */}
              <button
                className="close-modal-btn"
                onClick={() => setSelectedProduct(null)}
                style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: "rgba(255,255,255,0.95)", border: "none",
                  borderRadius: "50%", width: "34px", height: "34px",
                  fontSize: "1rem", fontWeight: "bold", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)", color: "#444", zIndex: 10
                }}
              >&#x2715;</button>
              {/* Logo góc */}
              <div style={{
                position: "absolute", bottom: "12px", right: "12px",
                background: "var(--primary)", color: "white",
                borderRadius: "50%", width: "44px", height: "44px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem", fontWeight: 800, lineHeight: 1.2, textAlign: "center",
                textTransform: "uppercase", letterSpacing: "0.5px"
              }}>&#127836;<br />247</div>
            </div>

            {/* Nội dung scroll được */}
            <div style={{ overflowY: "auto", flex: 1, padding: "18px 20px 0" }}>
              {/* Tên + giá + chọn số lượng */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 6px", lineHeight: 1.3 }}>
                    {selectedProduct.tenSanPham}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--sale-red)" }}>
                      {formatPrice(Number(selectedProduct.giaMoi) * quantity)}
                    </span>
                    {Number(selectedProduct.giaCu) > 0 && (
                      <span style={{ textDecoration: "line-through", color: "#aaa", fontSize: "0.9rem" }}>
                        {formatPrice(selectedProduct.giaCu)} đ
                      </span>
                    )}
                  </div>
                </div>
                {/* Bộ điều chỉnh số lượng */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0",
                  border: "1.5px solid #ddd", borderRadius: "8px", overflow: "hidden",
                  flexShrink: 0, height: "38px"
                }}>
                  <button
                    style={{
                      width: "36px", height: "100%", background: "#f5f5f5", border: "none",
                      fontSize: "1.3rem", cursor: "pointer", fontWeight: 700, color: "#555",
                      transition: "background 0.2s"
                    }}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    onMouseEnter={e => (e.currentTarget.style.background = "#ebebeb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#f5f5f5")}
                  >−</button>
                  <span style={{ minWidth: "36px", textAlign: "center", fontWeight: 700, fontSize: "1rem", padding: "0 4px" }}>
                    {quantity}
                  </span>
                  <button
                    style={{
                      width: "36px", height: "100%", background: "#f5f5f5", border: "none",
                      fontSize: "1.2rem", cursor: "pointer", fontWeight: 700, color: "#555",
                      transition: "background 0.2s"
                    }}
                    onClick={() => setQuantity(q => q + 1)}
                    onMouseEnter={e => (e.currentTarget.style.background = "#ebebeb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#f5f5f5")}
                  >+</button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "#f0e6d0", margin: "0 0 14px" }} />

              {/* Mô tả sản phẩm */}
              <div style={{ marginBottom: "14px" }}>
                <p style={{
                  fontSize: "0.93rem", lineHeight: 1.75, color: "#444",
                  margin: 0, whiteSpace: "pre-line"
                }}>
                  {selectedProduct.moTa || "Sản phẩm chất lượng cao, được chế biến từ nguyên liệu tươi sạch, đảm bảo an toàn vệ sinh thực phẩm."}
                </p>
              </div>

              {/* Thành phần */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>&#9989;</span> Thành phần & định lượng:
                </div>
                <ul style={{ listStyle: "none", padding: "0 0 0 4px", margin: 0 }}>
                  {getIngredients(selectedProduct.tenSanPham).map((item, idx) => (
                    <li key={idx} style={{
                      fontSize: "0.9rem", lineHeight: 1.8, color: "#444",
                      borderBottom: idx < getIngredients(selectedProduct.tenSanPham).length - 1 ? "1px dashed #f0e6d0" : "none",
                      padding: "2px 0"
                    }}>
                      &#8226; {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* === THƯỜNG ĐƯỢC MUA CÙNG === */}
              {(() => {
                const related = products.filter(
                  (p) => p.danhMucId === selectedProduct.danhMucId && p.id !== selectedProduct.id && p.trangThai === "con_hang"
                );
                if (related.length === 0) return null;
                const ITEMS_PER_VIEW = 2;
                const maxIdx = Math.max(0, related.length - ITEMS_PER_VIEW);
                return (
                  <div style={{ marginBottom: "20px" }}>
                    {/* Divider trên */}
                    <div style={{ height: "1px", background: "#f0e6d0", margin: "0 0 14px" }} />
                    {/* Tiêu đề + nút điều hướng */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: "12px"
                    }}>
                      <div style={{
                        fontWeight: 700, fontSize: "0.78rem", color: "#888",
                        letterSpacing: "1px", textTransform: "uppercase"
                      }}>
                        Thường được mua cùng
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setRelatedScrollIdx(i => Math.max(0, i - 1))}
                          disabled={relatedScrollIdx === 0}
                          style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            border: "1.5px solid #ddd", background: relatedScrollIdx === 0 ? "#f5f5f5" : "white",
                            cursor: relatedScrollIdx === 0 ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1rem", color: relatedScrollIdx === 0 ? "#ccc" : "#555",
                            transition: "all 0.2s", flexShrink: 0, lineHeight: 1
                          }}
                        >&#8249;</button>
                        <button
                          onClick={() => setRelatedScrollIdx(i => Math.min(maxIdx, i + 1))}
                          disabled={relatedScrollIdx >= maxIdx}
                          style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            border: "1.5px solid #ddd", background: relatedScrollIdx >= maxIdx ? "#f5f5f5" : "white",
                            cursor: relatedScrollIdx >= maxIdx ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1rem", color: relatedScrollIdx >= maxIdx ? "#ccc" : "#555",
                            transition: "all 0.2s", flexShrink: 0, lineHeight: 1
                          }}
                        >&#8250;</button>
                      </div>
                    </div>
                    {/* Carousel */}
                    <div style={{ overflow: "hidden" }}>
                      <div style={{
                        display: "flex",
                        gap: "10px",
                        transform: `translateX(calc(-${relatedScrollIdx} * (50% + 5px)))`,
                        transition: "transform 0.35s cubic-bezier(.4,0,.2,1)"
                      }}>
                        {related.map((rp) => (
                          <div
                            key={rp.id}
                            onClick={() => setSelectedProduct(rp)}
                            style={{
                              minWidth: "calc(50% - 5px)", maxWidth: "calc(50% - 5px)",
                              display: "flex", alignItems: "center", gap: "10px",
                              border: "1.5px solid #f0e0e0", borderRadius: "10px",
                              padding: "8px", cursor: "pointer",
                              background: "#fffaf8",
                              transition: "border-color 0.2s, box-shadow 0.2s",
                              flexShrink: 0
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)";
                              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(139,26,26,0.12)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLDivElement).style.borderColor = "#f0e0e0";
                              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                            }}
                          >
                            <img
                              src={rp.hinhAnh}
                              alt={rp.tenSanPham}
                              style={{ width: "54px", height: "54px", objectFit: "cover", borderRadius: "7px", flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: "0.82rem", fontWeight: 700, color: "#1a1a1a",
                                lineHeight: 1.3, marginBottom: "4px",
                                display: "-webkit-box", WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical", overflow: "hidden"
                              }}>{rp.tenSanPham}</div>
                              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--sale-red)" }}>
                                {formatPrice(rp.giaMoi)}đ
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Thanh thành tiền cố định */}
            <div style={{
              borderTop: "1.5px solid #f0e6d0",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "white",
              flexShrink: 0
            }}>
              <div>
                <div style={{ fontSize: "0.78rem", color: "#888", fontWeight: 500 }}>Thành tiền</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--sale-red)" }}>
                  {formatPrice(Number(selectedProduct.giaMoi) * quantity)} đ
                </div>
              </div>
              <button
                style={{
                  background: "var(--primary)", color: "white", border: "none",
                  borderRadius: "30px", padding: "12px 28px", fontSize: "1rem",
                  fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(139,26,26,0.3)",
                  transition: "all 0.2s", letterSpacing: "0.3px"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(139,26,26,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(139,26,26,0.3)"; }}
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart({
                      id: selectedProduct.id,
                      sanPhamId: selectedProduct.id,
                      tenSanPham: selectedProduct.tenSanPham,
                      hinhAnh: selectedProduct.hinhAnh,
                      giaMoi: Number(selectedProduct.giaMoi) || 0
                    });
                  }
                  setAddedToast(true);
                  setTimeout(() => setAddedToast(false), 2000);
                }}
              >
                &#128722; Thêm vào giỏ
              </button>
              {/* Toast thông báo */}
              {addedToast && (
                <div style={{
                  position: "absolute", bottom: "80px", left: "50%",
                  transform: "translateX(-50%)",
                  background: "#1a1a1a", color: "white",
                  padding: "10px 20px", borderRadius: "30px",
                  fontSize: "0.88rem", fontWeight: 600,
                  whiteSpace: "nowrap", zIndex: 100,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  animation: "fadeInUp 0.25s ease",
                  display: "flex", alignItems: "center", gap: "8px"
                }}>
                  <span style={{ color: "#4ade80", fontSize: "1rem" }}>✓</span>
                  Đã thêm vào giỏ hàng!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}