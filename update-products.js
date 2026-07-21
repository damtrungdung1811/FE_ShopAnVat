const updateMapping = {
  "Bánh tráng trộn": "/images/banh_trang_tron.png",
  "Trà sữa chân trâu đường đen": "/images/tra_sua_tran_chau.png",
  "Cơm cháy kho quẹt": "/images/com_chay_kho_quet.png",
  "Bánh mì Hội An": "/images/banh_mi_hoi_an.png",
  "Nước ép cam tươi": "/images/nuoc_ep_cam.png",
  "Pizza mini": "/images/pizza_mini.png",
  "Tokbokki phô mai": "/images/tokbokki.png",
  "Chè bưởi An Giang": "/images/che_buoi.png",
  "Sinh tố dâu tây": "/images/sinh_to_dau.png"
};

async function updateProducts() {
  try {
    const res = await fetch("http://localhost:3001/sanpham");
    const products = await res.json();
    
    let count = 0;
    for (const product of products) {
      if (updateMapping[product.tenSanPham]) {
        const newImage = updateMapping[product.tenSanPham];
        if (product.hinhAnh !== newImage) {
          const updateRes = await fetch(`http://localhost:3001/sanpham/${product.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...product,
              hinhAnh: newImage
            })
          });
          
          if (updateRes.ok) {
            console.log(`Updated ${product.tenSanPham} with image ${newImage}`);
            count++;
          } else {
            console.error(`Failed to update ${product.tenSanPham}`);
          }
        }
      }
    }
    console.log(`Total images updated: ${count}`);
  } catch (err) {
    console.error("Error connecting to server:", err);
  }
}

updateProducts();
