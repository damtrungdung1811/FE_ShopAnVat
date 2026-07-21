import Link from "next/link";

export default function GioiThieuPage() {
  return (
    <div className="about-content">

      {/* ====== PHẦN BANNER GIỚI THIỆU ====== */}
      <div className="about-hero">
        <h1>🍜 Ăn Vặt 247</h1>
        <p>
          Chào mừng bạn đến với Ăn Vặt 247 - Địa chỉ tin cậy cho những món ăn
          vặt ngon nhất Hà Nội. Chúng tôi cam kết mang đến cho bạn trải nghiệm
          ẩm thực tuyệt vời nhất!
        </p>
      </div>

      {/* ====== PHẦN CÂU CHUYỆN - ảnh bên trái, chữ bên phải ====== */}
      <div className="about-section">
        {/* Ảnh giới thiệu - đổi src để thay ảnh */}
        <img src="/images/banner1.png" alt="Về chúng tôi" className="about-img" />
        <div className="about-text">
          <h2>📖 Câu chuyện của chúng tôi</h2>
          <p>
            Ăn Vặt 247 được thành lập với niềm đam mê mãnh liệt dành cho ẩm
            thực đường phố Hà Nội. Xuất phát từ một quán nhỏ trên con phố Cầu
            Giấy, chúng tôi đã không ngừng phát triển để trở thành địa chỉ yêu
            thích của hàng ngàn khách hàng.
          </p>
          <p style={{ marginTop: "12px" }}>
            Mỗi món ăn được chúng tôi chế biến đều chứa đựng tâm huyết và sự
            tỉ mỉ, từ khâu lựa chọn nguyên liệu tươi ngon đến quy trình chế
            biến đạt chuẩn vệ sinh an toàn thực phẩm.
          </p>
        </div>
      </div>

      {/* ====== PHẦN SỨ MỆNH - ảnh bên phải, chữ bên trái (reverse) ====== */}
      <div className="about-section reverse">
        {/* Ảnh sứ mệnh - đổi src để thay ảnh */}
        <img src="/images/news_food.png" alt="Sứ mệnh" className="about-img" />
        <div className="about-text">
          <h2>🎯 Sứ mệnh của chúng tôi</h2>
          <p>
            Chúng tôi cam kết mang đến những món ăn vặt chất lượng cao với giá
            cả phải chăng. Dịch vụ giao hàng nhanh chóng trong vòng 30 phút,
            đảm bảo đồ ăn luôn nóng hổi và tươi ngon khi đến tay khách hàng.
          </p>
          <p style={{ marginTop: "12px" }}>
            Hình ảnh sản phẩm được chụp thật 100%, không chỉnh sửa. Bạn nhận
            được đúng những gì bạn thấy trên website!
          </p>
        </div>
      </div>

      {/* ====== PHẦN ĐẶC ĐIỂM NỔI BẬT ====== */}
      <div className="about-features">
        {/* Thẻ 1: Giao hàng */}
        <div className="about-feature-card">
          <div className="about-feature-icon">🛵</div>
          <h3>Giao hàng siêu tốc</h3>
          <p>
            Giao hàng nhanh chóng trong vòng 30 phút. Đảm bảo đồ ăn luôn nóng
            hổi và tươi ngon.
          </p>
        </div>
        {/* Thẻ 2: Chất lượng */}
        <div className="about-feature-card">
          <div className="about-feature-icon">✅</div>
          <h3>Chất lượng đảm bảo</h3>
          <p>
            Nguyên liệu tươi sạch, chế biến đạt chuẩn vệ sinh an toàn thực
            phẩm cao nhất.
          </p>
        </div>
        {/* Thẻ 3: Giá cả */}
        <div className="about-feature-card">
          <div className="about-feature-icon">💰</div>
          <h3>Giá cả phải chăng</h3>
          <p>
            Thưởng thức đồ ăn vặt ngon với giá từ 7,000đ. Nhiều chương trình
            khuyến mại hấp dẫn.
          </p>
        </div>
      </div>
    </div>
  );
}
