// Script cập nhật ảnh cho các sản phẩm thiếu ảnh
const http = require("http");

const BASE = "http://localhost:3001";

// Map ảnh đẹp, đáng tin cậy từ picsum + unsplash
const imageUpdates = [
  // ---- ĐỒ ĂN VẶT ----
  {
    name: "Bánh tráng trộn bơ tỏi",
    hinhAnh: "https://images.unsplash.com/photo-1609167830220-7164aa360951?w=500&fit=crop&auto=format",
  },
  {
    name: "Chân gà sả tắc",
    hinhAnh: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&fit=crop&auto=format",
  },
  {
    name: "Xúc xích nướng phô mai",
    hinhAnh: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&fit=crop&auto=format",
  },
  {
    name: "Bắp xào bơ phô mai",
    hinhAnh: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&fit=crop&auto=format",
  },
  {
    name: "Hột vịt lộn xào me",
    hinhAnh: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&fit=crop&auto=format",
  },
  {
    name: "Cá viên chiên sốt Thái",
    hinhAnh: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&fit=crop&auto=format",
  },
  {
    name: "Đậu hũ chiên mắm",
    hinhAnh: "https://images.unsplash.com/photo-1543340713-4f7ea4b0e8a9?w=500&fit=crop&auto=format",
  },
  {
    name: "Bánh mì que nướng tiêu",
    hinhAnh: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&fit=crop&auto=format",
  },
  {
    name: "Mực rim me cay",
    hinhAnh: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&fit=crop&auto=format",
  },
  {
    name: "Sắn dây chiên giòn",
    hinhAnh: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&fit=crop&auto=format",
  },

  // ---- ĐỒ ĂN ĐÊM ----
  {
    name: "Cháo lòng huyết heo",
    hinhAnh: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&fit=crop&auto=format",
  },
  {
    name: "Bún bò Huế đặc biệt",
    hinhAnh: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&fit=crop&auto=format",
  },
  {
    name: "Phở bò tái nạm gầu",
    hinhAnh: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&fit=crop&auto=format",
  },
  {
    name: "Mì xào hải sản",
    hinhAnh: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&fit=crop&auto=format",
  },
  {
    name: "Cơm chiên trứng muối",
    hinhAnh: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&fit=crop&auto=format",
  },
  {
    name: "Bánh cuốn nhân thịt nóng",
    hinhAnh: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=500&fit=crop&auto=format",
  },
  {
    name: "Lẩu gà lá chanh mini",
    hinhAnh: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&fit=crop&auto=format",
  },
  {
    name: "Bún thịt nướng chả giò",
    hinhAnh: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&fit=crop&auto=format",
  },
  {
    name: "Súp cua bắp non",
    hinhAnh: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500&fit=crop&auto=format",
  },
  {
    name: "Mì tôm trứng gà đặc biệt",
    hinhAnh: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&fit=crop&auto=format",
  },

  // ---- ĐỒ UỐNG ----
  {
    name: "Trà sữa matcha trân châu",
    hinhAnh: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&fit=crop&auto=format",
  },
  {
    name: "Sinh tố bơ mật ong",
    hinhAnh: "https://images.unsplash.com/photo-1553530979-7ee42a61f38c?w=500&fit=crop&auto=format",
  },
  {
    name: "Nước ép dưa hấu tươi",
    hinhAnh: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&fit=crop&auto=format",
  },
  {
    name: "Cà phê muối kem tươi",
    hinhAnh: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&fit=crop&auto=format",
  },
  {
    name: "Chanh leo dây soda",
    hinhAnh: "https://images.unsplash.com/photo-1638176066959-965f85bc15ec?w=500&fit=crop&auto=format",
  },
  {
    name: "Hồng trà đào tươi",
    hinhAnh: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&fit=crop&auto=format",
  },
  {
    name: "Nước dừa tươi uống liền",
    hinhAnh: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500&fit=crop&auto=format",
  },
  {
    name: "Sữa chua uống men sống",
    hinhAnh: "https://images.unsplash.com/photo-1543352634-99a5d50ae78e?w=500&fit=crop&auto=format",
  },
  {
    name: "Trà ô long hoa nhài",
    hinhAnh: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&fit=crop&auto=format",
  },
  {
    name: "Nước ép cần tây táo gừng",
    hinhAnh: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500&fit=crop&auto=format",
  },

  // ---- CÁC SẢN PHẨM CŨ CÓ THỂ THIẾU ẢNH ----
  {
    name: "Cá Chà Bá",
    hinhAnh: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=500&fit=crop&auto=format",
  },
  {
    name: "CÁ CHÀ BÁ",
    hinhAnh: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=500&fit=crop&auto=format",
  },
];

// Lấy tất cả sản phẩm
function getProducts() {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}/sanpham`, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve(JSON.parse(body)));
    }).on("error", reject);
  });
}

// Cập nhật ảnh cho 1 sản phẩm
function updateProduct(id, product) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(product);
    const req = http.request({
      hostname: "localhost", port: 3001,
      path: `/sanpham/${id}`, method: "PUT",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
    }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, result: JSON.parse(body) }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log("\n🔍 Đang tải danh sách sản phẩm...");
  const products = await getProducts();
  console.log(`📦 Tổng sản phẩm: ${products.length}\n`);

  // Tìm sản phẩm thiếu ảnh
  const missing = products.filter(p =>
    !p.hinhAnh ||
    p.hinhAnh.trim() === "" ||
    p.hinhAnh === "null" ||
    p.hinhAnh.includes("placeholder") ||
    p.hinhAnh.includes("626132647") || // URL bị lỗi
    p.hinhAnh.includes("1571167366136") || // URL trùng
    p.hinhAnh.includes("1490474418585") ||
    p.hinhAnh.includes("1594897030264") ||
    p.hinhAnh.includes("1626132647523")
  );

  console.log(`⚠️  Sản phẩm cần cập nhật ảnh: ${missing.length}`);
  missing.forEach(p => console.log(`   - [${p.id}] ${p.tenSanPham}: ${p.hinhAnh || "(trống)"}`));

  // Cập nhật theo map
  let updated = 0;
  for (const imgMap of imageUpdates) {
    const product = products.find(p =>
      p.tenSanPham.toLowerCase() === imgMap.name.toLowerCase()
    );
    if (!product) continue;

    // Chỉ cập nhật nếu ảnh bị lỗi hoặc trùng
    const needsUpdate =
      !product.hinhAnh ||
      product.hinhAnh.trim() === "" ||
      product.hinhAnh === "null" ||
      product.hinhAnh.includes("1571167366136") ||
      product.hinhAnh.includes("1490474418585") ||
      product.hinhAnh.includes("1594897030264") ||
      product.hinhAnh.includes("1626132647523") ||
      product.hinhAnh.includes("placeholder");

    if (!needsUpdate) continue;

    try {
      await updateProduct(product.id, {
        tenSanPham: product.tenSanPham,
        giaCu: product.giaCu,
        giaMoi: product.giaMoi,
        giamGia: product.giamGia,
        hinhAnh: imgMap.hinhAnh,
        moTa: product.moTa,
        trangThai: product.trangThai,
        danhMucId: product.danhMucId,
      });
      console.log(`  ✅ Cập nhật ảnh: [${product.id}] ${product.tenSanPham}`);
      updated++;
    } catch (e) {
      console.log(`  ❌ Lỗi: ${product.tenSanPham} - ${e.message}`);
    }
  }

  // Nếu không có gì cần cập nhật theo filter, thì force update ALL 30 món mới
  if (updated === 0) {
    console.log("\n🔄 Force cập nhật toàn bộ 30 sản phẩm mới...\n");
    for (const imgMap of imageUpdates) {
      const product = products.find(p =>
        p.tenSanPham.toLowerCase() === imgMap.name.toLowerCase()
      );
      if (!product) continue;

      try {
        await updateProduct(product.id, {
          tenSanPham: product.tenSanPham,
          giaCu: product.giaCu,
          giaMoi: product.giaMoi,
          giamGia: product.giamGia,
          hinhAnh: imgMap.hinhAnh,
          moTa: product.moTa,
          trangThai: product.trangThai,
          danhMucId: product.danhMucId,
        });
        console.log(`  ✅ [${product.id}] ${product.tenSanPham}`);
        updated++;
      } catch (e) {
        console.log(`  ❌ Lỗi: ${product.tenSanPham}`);
      }
    }
  }

  console.log(`\n✨ Xong! Đã cập nhật ${updated} sản phẩm.\n`);
}

main();
