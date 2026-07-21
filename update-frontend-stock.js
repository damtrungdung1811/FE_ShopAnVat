const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/home/page.tsx',
  'app/home/doanvat/page.tsx',
  'app/home/doandem/page.tsx',
  'app/home/douong/page.tsx',
  'app/home/timkiem/page.tsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Add soLuongTon?: number; to Product interface if not exists
    if (!content.includes('soLuongTon?: number;')) {
      content = content.replace(/tenDanhMuc\?:\s*string;/, 'tenDanhMuc?: string;\n  soLuongTon?: number;');
    }

    // Replace <button className="add-to-cart-btn"...>🛒 Thêm vào giỏ</button> with conditional logic
    const buttonRegex = /<button\s+className="add-to-cart-btn"[\s\S]*?onClick=\{\(e\) => \{[\s\S]*?addToCart\(\{[\s\S]*?\}\);[\s\S]*?alert\("Đã thêm vào giỏ hàng: " \+ product\.tenSanPham\);[\s\S]*?\}\}[\s\S]*?>\s*🛒 Thêm vào giỏ\s*<\/button>/g;
    content = content.replace(buttonRegex, (match) => {
      return `{product.soLuongTon !== undefined && product.soLuongTon <= 0 ? (
                  <button 
                    className="add-to-cart-btn"
                    style={{ marginTop: "10px", width: "100%", padding: "8px", background: "#aaa", color: "white", border: "none", borderRadius: "6px", cursor: "not-allowed", fontWeight: "bold" }}
                    disabled
                  >
                    ❌ Hết hàng
                  </button>
                ) : (
                  ${match.trim()}
                )}`;
    });

    // Replace modal <button className="add-to-cart-btn modal-add-btn"...>🛒 Thêm vào giỏ hàng</button> with conditional logic
    const modalButtonRegex = /<button\s+className="add-to-cart-btn modal-add-btn"[\s\S]*?onClick=\{\(\) => \{[\s\S]*?addToCart\(\{[\s\S]*?\}\);[\s\S]*?setSelectedProduct\(null\);[\s\S]*?alert\("Đã thêm vào giỏ hàng: " \+ selectedProduct\.tenSanPham\);[\s\S]*?\}\}[\s\S]*?>\s*🛒 Thêm vào giỏ hàng\s*<\/button>/g;
    content = content.replace(modalButtonRegex, (match) => {
      return `{selectedProduct.soLuongTon !== undefined && selectedProduct.soLuongTon <= 0 ? (
              <button 
                className="add-to-cart-btn modal-add-btn" 
                style={{ background: "#aaa", color: "white", border: "none", cursor: "not-allowed", fontWeight: "bold" }}
                disabled
              >
                ❌ Hết hàng
              </button>
            ) : (
              ${match.trim()}
            )}`;
    });

    // For app/home/page.tsx specifically, update the modal button logic which is different
    const modalButtonPageTsxRegex = /<button\s+style=\{\{[\s\S]*?boxShadow: "0 4px 12px rgba\(139,26,26,0\.3\)"[\s\S]*?\}\}[\s\S]*?onClick=\{\(\) => \{[\s\S]*?for \(let i = 0; i < quantity; i\+\+\) \{[\s\S]*?addToCart\(\{[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?setAddedToast\(true\);[\s\S]*?setTimeout\([\s\S]*?\}\}[\s\S]*?>\s*🛒 Thêm vào giỏ\s*<\/button>/g;
    content = content.replace(modalButtonPageTsxRegex, (match) => {
      return `{selectedProduct.soLuongTon !== undefined && selectedProduct.soLuongTon <= 0 ? (
              <button
                style={{
                  background: "#aaa", color: "white", border: "none",
                  borderRadius: "30px", padding: "12px 28px", fontSize: "1rem",
                  fontWeight: 700, cursor: "not-allowed", boxShadow: "none",
                  letterSpacing: "0.3px"
                }}
                disabled
              >
                ❌ Hết hàng
              </button>
            ) : (
              ${match.trim()}
            )}`;
    });

    // Also in app/home/page.tsx "Thường được mua cùng" section
    const relatedItemRegex = /onClick=\{\(\) => setSelectedProduct\(rp\)\}/g;

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${filePath}`);
  }
});
