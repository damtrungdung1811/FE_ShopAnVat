// Script thêm sản phẩm mới vào database
const http = require("http");

const BASE_URL = "http://localhost:3001";

const newProducts = [
  // ============ ĐỒ ĂN VẶT (danhMucId = 1) ============
  {
    tenSanPham: "Bánh tráng trộn bơ tỏi",
    giaCu: 20000,
    giaMoi: 15000,
    giamGia: "-25%",
    hinhAnh: "https://images.unsplash.com/photo-1626132647523-66c8b66a2a4a?w=400&q=80",
    moTa: "Bánh tráng giòn tan trộn với bơ tỏi thơm lừng, ăn một lần là nghiện.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Chân gà sả tắc",
    giaCu: 30000,
    giaMoi: 25000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1609167830220-7164aa360951?w=400&q=80",
    moTa: "Chân gà ngâm sả tắc chua cay ngọt, thơm ngon đậm đà.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Xúc xích nướng phô mai",
    giaCu: 25000,
    giaMoi: 20000,
    giamGia: "-20%",
    hinhAnh: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80",
    moTa: "Xúc xích tươi nướng than hoa, phủ phô mai béo ngậy, ăn kèm tương ớt.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Bắp xào bơ phô mai",
    giaCu: 18000,
    giaMoi: 14000,
    giamGia: "-22%",
    hinhAnh: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80",
    moTa: "Bắp ngọt xào bơ phô mai thơm lừng, rắc thêm chà bông cực ngon.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Hột vịt lộn xào me",
    giaCu: 20000,
    giaMoi: 17000,
    giamGia: "-15%",
    hinhAnh: "https://images.unsplash.com/photo-1571167366136-b57e098be765?w=400&q=80",
    moTa: "Hột vịt lộn xào tương me chua ngọt, rắc vừng rang thơm phức.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Cá viên chiên sốt Thái",
    giaCu: 22000,
    giaMoi: 18000,
    giamGia: "-18%",
    hinhAnh: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    moTa: "Cá viên chiên giòn tan, chấm sốt Thái cay ngọt đặc trưng.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Đậu hũ chiên mắm",
    giaCu: 15000,
    giaMoi: 12000,
    giamGia: "-20%",
    hinhAnh: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
    moTa: "Đậu hũ non chiên vàng ươm, chấm mắm ớt ngọt cực hợp.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Bánh mì que nướng tiêu",
    giaCu: 12000,
    giaMoi: 9000,
    giamGia: "-25%",
    hinhAnh: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
    moTa: "Bánh mì que giòn xốp, nướng bơ tiêu thơm, ăn kèm sốt phô mai.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Mực rim me cay",
    giaCu: 35000,
    giaMoi: 28000,
    giamGia: "-20%",
    hinhAnh: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
    moTa: "Mực tươi rim me chua ngọt cay, đậm đà hương vị đặc trưng.",
    trangThai: "con_hang",
    danhMucId: 1,
  },
  {
    tenSanPham: "Sắn dây chiên giòn",
    giaCu: 16000,
    giaMoi: 13000,
    giamGia: "-19%",
    hinhAnh: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
    moTa: "Sắn dây thái lát mỏng chiên giòn tan, rắc muối ớt và húng lìu.",
    trangThai: "con_hang",
    danhMucId: 1,
  },

  // ============ ĐỒ ĂN ĐÊM (danhMucId = 2) ============
  {
    tenSanPham: "Cháo lòng huyết heo",
    giaCu: 45000,
    giaMoi: 38000,
    giamGia: "-16%",
    hinhAnh: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
    moTa: "Cháo lòng nóng hổi, nấu từ xương hầm, kèm huyết heo mềm mịn.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Bún bò Huế đặc biệt",
    giaCu: 60000,
    giaMoi: 50000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80",
    moTa: "Bún bò Huế cay nồng, nước dùng ngọt xương, giò heo mềm thơm.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Phở bò tái nạm gầu",
    giaCu: 65000,
    giaMoi: 55000,
    giamGia: "-15%",
    hinhAnh: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80",
    moTa: "Phở bò truyền thống, nước dùng trong ngọt, thịt bò tái mềm ngon.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Mì xào hải sản",
    giaCu: 70000,
    giaMoi: 58000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80",
    moTa: "Mì xào tôm mực thập cẩm, sốt hải sản đậm đà, rau xanh giòn tươi.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Cơm chiên trứng muối",
    giaCu: 55000,
    giaMoi: 45000,
    giamGia: "-18%",
    hinhAnh: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80",
    moTa: "Cơm chiên trứng muối béo ngậy, rắc vừng rang thơm cực hấp dẫn.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Bánh cuốn nhân thịt nóng",
    giaCu: 50000,
    giaMoi: 42000,
    giamGia: "-16%",
    hinhAnh: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80",
    moTa: "Bánh cuốn tráng mỏng nhân thịt băm nấm mèo, chấm nước mắm chua ngọt.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Lẩu gà lá chanh mini",
    giaCu: 120000,
    giaMoi: 99000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    moTa: "Lẩu gà ta hầm lá chanh thơm ngát, nước lẩu trong ngọt tự nhiên.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Bún thịt nướng chả giò",
    giaCu: 60000,
    giaMoi: 50000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80",
    moTa: "Bún thịt heo nướng than thơm, chả giò giòn vàng, rau sống tươi mát.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Súp cua bắp non",
    giaCu: 40000,
    giaMoi: 33000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80",
    moTa: "Súp cua đặc sánh, nhiều thịt cua, trứng cút và bắp non ngọt.",
    trangThai: "con_hang",
    danhMucId: 2,
  },
  {
    tenSanPham: "Mì tôm trứng gà đặc biệt",
    giaCu: 30000,
    giaMoi: 25000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
    moTa: "Mì tôm nước dùng đậm đà, thêm trứng gà lòng đào và hành phi thơm.",
    trangThai: "con_hang",
    danhMucId: 2,
  },

  // ============ ĐỒ UỐNG (danhMucId = 3) ============
  {
    tenSanPham: "Trà sữa matcha trân châu",
    giaCu: 45000,
    giaMoi: 38000,
    giamGia: "-16%",
    hinhAnh: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
    moTa: "Trà sữa matcha Nhật thơm béo, trân châu đen dai ngon không thể cưỡng.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Sinh tố bơ mật ong",
    giaCu: 40000,
    giaMoi: 33000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80",
    moTa: "Sinh tố bơ chín xay kem tươi, thêm mật ong nguyên chất cực béo ngon.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Nước ép dưa hấu tươi",
    giaCu: 30000,
    giaMoi: 25000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&q=80",
    moTa: "Nước ép dưa hấu đỏ tươi, ngọt mát giải nhiệt cực kỳ tốt cho sức khoẻ.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Cà phê muối kem tươi",
    giaCu: 42000,
    giaMoi: 35000,
    giamGia: "-17%",
    hinhAnh: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80",
    moTa: "Cà phê muối đặc trưng Đà Nẵng, phủ lớp kem tươi mằn mặn béo ngậy.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Chanh leo dây soda",
    giaCu: 28000,
    giaMoi: 22000,
    giamGia: "-21%",
    hinhAnh: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
    moTa: "Chanh leo chua thanh mát, kết hợp dây leo tươi và soda lạnh cực kỳ sảng khoái.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Hồng trà đào tươi",
    giaCu: 40000,
    giaMoi: 32000,
    giamGia: "-20%",
    hinhAnh: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    moTa: "Hồng trà Đài Loan mềm mịn kết hợp đào tươi ngọt thơm, cực hấp dẫn.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Nước dừa tươi uống liền",
    giaCu: 25000,
    giaMoi: 20000,
    giamGia: "-20%",
    hinhAnh: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&q=80",
    moTa: "Nước dừa tươi 100% tự nhiên, ngọt mát thanh, bổ dưỡng và giải khát.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Sữa chua uống men sống",
    giaCu: 22000,
    giaMoi: 18000,
    giamGia: "-18%",
    hinhAnh: "https://images.unsplash.com/photo-1571167366136-b57e098be765?w=400&q=80",
    moTa: "Sữa chua lên men tự nhiên, vị chua thanh nhẹ, tốt cho hệ tiêu hoá.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Trà ô long hoa nhài",
    giaCu: 35000,
    giaMoi: 28000,
    giamGia: "-20%",
    hinhAnh: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80",
    moTa: "Trà ô long cao cấp ướp hoa nhài thơm dịu, thanh mát và thư giãn tuyệt vời.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
  {
    tenSanPham: "Nước ép cần tây táo gừng",
    giaCu: 38000,
    giaMoi: 30000,
    giamGia: "-21%",
    hinhAnh: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80",
    moTa: "Detox cần tây táo gừng tươi, giúp thanh lọc cơ thể và tăng cường sức đề kháng.",
    trangThai: "con_hang",
    danhMucId: 3,
  },
];

function postProduct(product) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(product);
    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/sanpham",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({ name: product.tenSanPham, status: res.statusCode, result: json });
        } catch {
          resolve({ name: product.tenSanPham, status: res.statusCode, result: body });
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`\n🚀 Bắt đầu thêm ${newProducts.length} sản phẩm...\n`);
  let success = 0;
  let fail = 0;

  for (const product of newProducts) {
    try {
      const result = await postProduct(product);
      if (result.status === 200 || result.result?.status === true) {
        console.log(`  ✅ Thêm thành công: ${result.name} (ID: ${result.result?.id})`);
        success++;
      } else {
        console.log(`  ⚠️  Bỏ qua: ${result.name} → ${result.result?.message || "Lỗi không xác định"}`);
        fail++;
      }
    } catch (err) {
      console.log(`  ❌ Lỗi: ${product.tenSanPham} → ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✨ Hoàn thành! Thành công: ${success}, Bỏ qua/Lỗi: ${fail}\n`);
}

main();
