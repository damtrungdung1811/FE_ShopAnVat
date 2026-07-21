const fs = require('fs');
const path = require('path');

// 1. Create backend
fs.mkdirSync(path.join(__dirname, 'backend', 'images'), { recursive: true });

const dbData = {
  san_pham: [
    { id: 1, ten: 'Paracetamol 500mg', gia: 10000, danhMuc: 'Thuốc giảm đau', mo_ta: 'Giảm đau hạ sốt', hinh_anh: '', trangThai: 'Còn hàng' },
    { id: 2, ten: 'Ibuprofen', gia: 15000, danhMuc: 'Thuốc giảm đau', mo_ta: 'Giảm viêm', hinh_anh: '', trangThai: 'Còn hàng' },
    { id: 3, ten: 'Vitamin C', gia: 8000, danhMuc: 'Vitamin', mo_ta: 'Tăng đề kháng', hinh_anh: '', trangThai: 'Còn hàng' },
    { id: 4, ten: 'Nhiệt kế điện tử', gia: 50000, danhMuc: 'Thiết bị y tế', mo_ta: 'Đo nhiệt độ cơ thể', hinh_anh: '', trangThai: 'Còn hàng' }
  ],
  khach_hang: [
    { id: 1, ten: "Nguyễn Văn A", sdt: "0901234567", email: "a@gmail.com", diaChi: "Hà Nội", soDonHang: 1 },
    { id: 2, ten: "Trần Thị B", sdt: "0912345678", email: "b@gmail.com", diaChi: "Hải Dương", soDonHang: 1 }
  ],
  don_hang: [
    { id: 1, khachHang: "Nguyễn Văn A", sanPham: "Paracetamol 500mg x2", tongTien: 20000, trangThai: "Đang xử lý", ngayDat: "18/03/2026" },
    { id: 2, khachHang: "Trần Thị B", sanPham: "Vitamin C x1", tongTien: 8000, trangThai: "Đang xử lý", ngayDat: "18/03/2026" }
  ],
  nhan_vien: [
    { id: 1, ten: "Lê Văn Admin", sdt: "0988888888", chucVu: "Quản lý", ngayVaoLam: "18/03/2026", trangThai: "Đang làm" },
    { id: 2, ten: "Phạm Thị C", sdt: "0977777777", chucVu: "Nhân viên", ngayVaoLam: "18/03/2026", trangThai: "Đang làm" }
  ],
  kho: [
    { id: 1, tenSanPham: "Paracetamol 500mg", danhMuc: "Thuốc giảm đau", tonKho: 100, nhapVao: 150, donViTinh: "Hộp", giaNhap: 7000, trangThai: "Còn hàng", daBan: 50 },
    { id: 2, tenSanPham: "Vitamin C", danhMuc: "Vitamin", tonKho: 200, nhapVao: 250, donViTinh: "Lọ", giaNhap: 5000, trangThai: "Còn hàng", daBan: 50 }
  ],
  tai_khoan: [
    { id: 1, tenDangNhap: "admin", matKhau: "123456", hoTen: "Admin", email: "", vaiTro: "Admin", trangThai: "Hoạt động", ngayTao: "18/03/2026" },
    { id: 2, tenDangNhap: "user1", matKhau: "123456", hoTen: "User 1", email: "", vaiTro: "User", trangThai: "Hoạt động", ngayTao: "18/03/2026" }
  ]
};

fs.writeFileSync(path.join(__dirname, 'backend', 'db.json'), JSON.stringify(dbData, null, 2));

// 2. Create lib/store.ts
const storeTs = `import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'backend', 'db.json');

export async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { san_pham: [], don_hang: [], khach_hang: [], nhan_vien: [], kho: [], tai_khoan: [] };
  }
}

export async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
`;
fs.mkdirSync(path.join(__dirname, 'lib'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'lib', 'store.ts'), storeTs);

// 3. Generate API routes
const tables = [
  'san_pham', 'khach_hang', 'don_hang', 'nhan_vien', 'kho', 'tai_khoan'
];

tables.forEach((table) => {
  const routeName = table.replace('_', ''); // san_pham -> sanpham
  const dir = path.join(__dirname, 'app', 'api', routeName);
  const idDir = path.join(dir, '[id]');
  
  fs.mkdirSync(idDir, { recursive: true });

  const routeContent = `import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/store';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db['${table}'] || []);
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await readDB();
    
    if (!db['${table}']) db['${table}'] = [];
    
    // Auto increment ID
    const newId = db['${table}'].length > 0 ? Math.max(...db['${table}'].map((i: any) => i.id)) + 1 : 1;
    const newItem = { id: newId, ...body };
    
    db['${table}'].push(newItem);
    await writeDB(db);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi request' }, { status: 400 });
  }
}
`;
  fs.writeFileSync(path.join(dir, 'route.ts'), routeContent);

  const idRouteContent = `import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/store';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const db = await readDB();
  const index = (db['${table}'] || []).findIndex((item: any) => item.id === Number(params.id));
  
  if (index === -1) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
  
  return NextResponse.json(db['${table}'][index]);
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await request.json();
  const db = await readDB();
  const index = (db['${table}'] || []).findIndex((item: any) => item.id === Number(params.id));
  
  if (index === -1) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
  
  db['${table}'][index] = { ...db['${table}'][index], ...body, id: Number(params.id) };
  await writeDB(db);
  
  return NextResponse.json(db['${table}'][index]);
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const db = await readDB();
  const index = (db['${table}'] || []).findIndex((item: any) => item.id === Number(params.id));
  
  if (index === -1) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
  
  db['${table}'].splice(index, 1);
  await writeDB(db);
  
  return new NextResponse(null, { status: 204 });
}
`;
  fs.writeFileSync(path.join(idDir, 'route.ts'), idRouteContent);
});

console.log('✅ Created backend API and DB successfully');
