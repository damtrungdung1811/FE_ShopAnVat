const fs = require('fs');
const path = require('path');

const tables = [
  { table: 'danh_muc', route: 'danhmuc' },
  { table: 'san_pham', route: 'sanpham' },
  { table: 'khach_hang', route: 'khachhang' },
  { table: 'don_hang', route: 'donhang' },
  { table: 'chi_tiet_don_hang', route: 'chitietdonhang' },
  { table: 'nhan_vien', route: 'nhanvien' },
  { table: 'kho', route: 'kho' },
  { table: 'tai_khoan', route: 'taikhoan' },
  { table: 'tin_tuc', route: 'tintuc' }
];

tables.forEach(({ table, route }) => {
  const dir = path.join(__dirname, 'app', 'api', route);
  const idDir = path.join(dir, '[id]');
  
  fs.mkdirSync(idDir, { recursive: true });

  const routeContent = `import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM ${table}');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fields = Object.keys(body);
    const values = fields.map(k => body[k]);
    
    if (fields.length === 0) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }
    
    const placeholders = fields.map(() => '?').join(', ');
    const query = \`INSERT INTO ${table} (\${fields.join(', ')}) VALUES (\${placeholders})\`;
    
    const [result] = await pool.query(query, values);
    return NextResponse.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}`;

  fs.writeFileSync(path.join(dir, 'route.ts'), routeContent);

  const idRouteContent = `import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const [rows] = await pool.query('SELECT * FROM ${table} WHERE id = ?', [params.id]);
    const items = rows as any[];
    if (items.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(items[0]);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    
    // Check if exists
    const [rows] = await pool.query('SELECT * FROM ${table} WHERE id = ?', [params.id]);
    const items = rows as any[];
    if (items.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Update dynamically
    const fields = Object.keys(body).filter(k => k !== 'id');
    const values = fields.map(k => body[k]);
    
    if (fields.length > 0) {
      const setClause = fields.map(k => \`\${k} = ?\`).join(', ');
      await pool.query(\`UPDATE ${table} SET \${setClause} WHERE id = ?\`, [...values, params.id]);
    }
    
    return NextResponse.json({ id: params.id, ...items[0], ...body });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const [result] = await pool.query('DELETE FROM ${table} WHERE id = ?', [params.id]);
    if ((result as any).affectedRows === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}`;

  fs.writeFileSync(path.join(idDir, 'route.ts'), idRouteContent);
});

console.log('Successfully generated all API routes');
