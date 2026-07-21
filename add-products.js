const newProducts = [
  {
    tenSanPham: "Bánh tráng trộn",
    giaCu: "25000",
    giaMoi: "20000",
    giamGia: "-20%",
    hinhAnh: "/images/news_food.png",
    moTa: "Bánh tráng trộn chua ngọt siêu ngon",
    trangThai: "con_hang",
    danhMucId: 1
  },

  
  {
    tenSanPham: "Trà sữa chân trâu đường đen",
    giaCu: "40000",
    giaMoi: "35000",
    giamGia: "-12%",
    hinhAnh: "/images/bubble_tea.png",
    moTa: "Trà sữa đậm vị kèm trân châu giòn dai",
    trangThai: "con_hang",
    danhMucId: 3
  },
  {
    tenSanPham: "Cơm cháy kho quẹt",
    giaCu: "50000",
    giaMoi: "45000",
    giamGia: "-10%",
    hinhAnh: "/images/night_food.png",
    moTa: "Món ăn đêm tuyệt vời",
    trangThai: "con_hang",
    danhMucId: 2
  },
  {
    tenSanPham: "Bánh mì Hội An",
    giaCu: "30000",
    giaMoi: "28000",
    giamGia: null,
    hinhAnh: "/images/banner1.png",
    moTa: "Bánh mì đặc biệt",
    trangThai: "con_hang",
    danhMucId: 2
  },
  {
    tenSanPham: "Nước ép cam tươi",
    giaCu: "35000",
    giaMoi: "30000",
    giamGia: "-15%",
    hinhAnh: "/images/carrot_juice.png",
    moTa: "Nước cam vắt tươi rói 100%",
    trangThai: "con_hang",
    danhMucId: 3
  },
  {
    tenSanPham: "Pizza mini",
    giaCu: "45000",
    giaMoi: "42000",
    giamGia: null,
    hinhAnh: "/images/banner2.png",
    moTa: "Pizza mini xúc xích phô mai",
    trangThai: "con_hang",
    danhMucId: 1
  },
  {
    tenSanPham: "Tokbokki phô mai",
    giaCu: "55000",
    giaMoi: "49000",
    giamGia: "-10%",
    hinhAnh: "/images/news_food.png",
    moTa: "Tokbokki cay ngọt thơm lừng",
    trangThai: "con_hang",
    danhMucId: 1
  },
  {
    tenSanPham: "Chè bưởi An Giang",
    giaCu: "25000",
    giaMoi: "22000",
    giamGia: null,
    hinhAnh: "/images/noodle.png",
    moTa: "Chè bưởi dai giòn sần sật",
    trangThai: "con_hang",
    danhMucId: 2
  },
  {
    tenSanPham: "Sinh tố dâu tây",
    giaCu: "45000",
    giaMoi: "40000",
    giamGia: "-11%",
    hinhAnh: "/images/bubble_tea.png",
    moTa: "Sinh tố dâu tươi mát lịm",
    trangThai: "con_hang",
    danhMucId: 3
  }
];

async function addProducts() {
  let count = 0;
  for (const product of newProducts) {
    try {
      const resp = await fetch('http://localhost:3001/sanpham', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      if (resp.ok) {
        count++;
        console.log("Added: " + product.tenSanPham);
      } else {
        console.error("Failed to add: " + product.tenSanPham, resp.status);
      }
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log("Total added: " + count);
}
addProducts();
