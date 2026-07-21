import Image from "next/image";
import Link from "next/link";

const newsItems = [
  {
    id: 1,
    title: "10 món ăn vặt khoái khẩu mùa hè của teen Hà thành",
    desc: "Hoa quả dầm, caramen, sữa chua mít liên ngội mùa nắng nóng. Chè Chè trân châu, kem cuộn, trà sữa... là những món ăn vặt được giới trẻ Hà Nội yêu thích nhất vào mùa hè.",
    date: "15/03/2026",
    img: "/images/news_food.png",
  },
  {
    id: 2,
    title: "Các món ăn vặt vào mùa đông giá chỉ từ 10k",
    desc: "Cứ mỗi khi đông về là người ta luôn có cảm giác đói hơn. Những món ăn vặt nóng hổi với giá chỉ từ 10k sẽ giúp bạn ấm bụng trong những ngày se lạnh.",
    date: "10/03/2026",
    img: "/images/banner1.png",
  },
  {
    id: 3,
    title: "Những món ăn vặt tại Hà Nội vào mùa đông",
    desc: "Hà Nội đang bước vào những ngày mùa đông lạnh giá. Và những ngày mùa đông Hà Nội, không gì tuyệt vời hơn được thưởng thức những món ăn vặt nóng hổi.",
    date: "05/03/2026",
    img: "/images/night_food.png",
  },
  {
    id: 4,
    title: '21 món ăn mới lạ ở Hà Nội đảm bảo "no quên lối về"',
    desc: "Danh sách những món ăn vặt ngon Hà Nội bên dưới đây sẽ không làm bạn thất vọng. Từ đồ ăn truyền thống đến hiện đại, tất cả đều có tại Ăn Vặt 247.",
    date: "28/02/2026",
    img: "/images/banner2.png",
  },
  {
    id: 5,
    title: "Top 5 quán ăn đêm ngon nhất Hà Nội",
    desc: "Khám phá những quán ăn đêm nổi tiếng nhất Hà Nội, nơi bạn có thể thưởng thức đồ ăn nóng hổi vào bất kỳ lúc nào trong đêm khuya.",
    date: "20/02/2026",
    img: "/images/night_food.png",
  },
  {
    id: 6,
    title: "Khuyến mại tháng 3 - Giảm 30% toàn bộ đồ ăn vặt",
    desc: "Nhân dịp tháng 3, Ăn Vặt 247 tung chương trình khuyến mại cực lớn - giảm 30% toàn bộ sản phẩm đồ ăn vặt. Đừng bỏ lỡ cơ hội này!",
    date: "01/03/2026",
    img: "/images/fries.png",
  },
];

export default function TinTucPage() {
  return (
    <div className="category-page">
      <div className="breadcrumb">
        <Link href="/home">🏠 Trang chủ</Link>
        <span>/</span>
        <span>Tin tức</span>
      </div>

      <div className="category-page-header">
        <h1>📰 Tin Tức Khuyến Mại</h1>
        <p>Cập nhật những tin tức mới nhất và chương trình khuyến mại hấp dẫn</p>
      </div>

      <div className="news-page-grid">
        {newsItems.map((item) => (
          <div className="news-page-card" key={item.id}>
            <Image
              src={item.img}
              alt={item.title}
              width={400}
              height={200}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <div className="news-page-card-body">
              <div className="date">📅 {item.date}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <Link href="#" className="read-more">
                Đọc thêm →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
