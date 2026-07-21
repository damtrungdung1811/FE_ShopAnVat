"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";

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

export default function DoUongPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3001/sanpham");
        const data = await res.json();

        const filtered = data.filter((item: Product) => item.danhMucId === 3 && item.trangThai === "con_hang");
        setProducts(filtered);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm đồ uống:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
    <div className="category-page">
      <div className="breadcrumb">
        <Link href="/home">🏠 Trang chủ</Link>
        <span>/</span>
        <span>Đồ uống</span>
      </div>

      <div className="category-page-header">
        <h1>🥤 Đồ Uống</h1>
        <p>Các loại đồ uống mát lạnh, tươi ngon cho mọi thời điểm trong ngày</p>
      </div>

      <div className="products-4col">
        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : products.length === 0 ? (
          <p>Chưa có sản phẩm đồ uống.</p>
        ) : (
          products.map((product) => (
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
                  <span className="price-new">
                    {formatPrice(product.giaMoi)} đ
                  </span>
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
          ))
        )}
      </div>

      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedProduct(null)}>✕</button>
            <div className="modal-header">
              <img src={selectedProduct.hinhAnh} alt={selectedProduct.tenSanPham} />
              <div className="modal-title-area">
                <h2>{selectedProduct.tenSanPham}</h2>
                <div className="modal-price-area">{formatPrice(selectedProduct.giaMoi)} đ</div>
              </div>
            </div>
            <div className="modal-body">
              <h3>📝 Nguồn gốc & Mô tả:</h3>
              <p>{selectedProduct.moTa || "Chưa có thông tin chi tiết cho sản phẩm này."}</p>
              
              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>🥗 Thành phần món ăn:</h3>
              <ul style={{ listStyleType: 'none', paddingLeft: '5px', lineHeight: '2.2', fontSize: '0.95rem', color: '#333' }}>
                {getIngredients(selectedProduct.tenSanPham).map((ingredient, idx) => (
                  <li key={idx}>🔸 {ingredient}</li>
                ))}
              </ul>
            </div>
            {selectedProduct.soLuongTon !== undefined && selectedProduct.soLuongTon <= 0 ? (
              <button 
                className="add-to-cart-btn modal-add-btn" 
                style={{ background: "#aaa", color: "white", border: "none", cursor: "not-allowed", fontWeight: "bold" }}
                disabled
              >
                ❌ Hết hàng
              </button>
            ) : (
              <button 
              className="add-to-cart-btn modal-add-btn" 
              style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}
              onClick={() => {
                addToCart({
                  id: selectedProduct.id,
                  sanPhamId: selectedProduct.id,
                  tenSanPham: selectedProduct.tenSanPham,
                  hinhAnh: selectedProduct.hinhAnh,
                  giaMoi: Number(selectedProduct.giaMoi) || 0
                });
                setSelectedProduct(null);
                alert("Đã thêm vào giỏ hàng: " + selectedProduct.tenSanPham);
              }}
            >
              🛒 Thêm vào giỏ hàng
            </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}