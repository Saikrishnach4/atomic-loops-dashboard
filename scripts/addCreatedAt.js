const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function toIso(dateLike) {
  try {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch (_) {
    return null;
  }
}

function main() {
  const exists = fs.existsSync(DB_PATH);
  if (!exists) {
    console.error('db.json not found at', DB_PATH);
    process.exit(1);
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const db = JSON.parse(raw);

  const baseUsers = new Date('2025-08-01T12:00:00.000Z').getTime();
  const baseProducts = new Date('2025-08-02T12:00:00.000Z').getTime();

  if (Array.isArray(db.users)) {
    db.users = db.users.map((u, idx) => {
      const has = u && typeof u.createdAt === 'string' && toIso(u.createdAt);
      const createdAt = has || new Date(baseUsers + idx * 60_000).toISOString();
      return { ...u, createdAt };
    });
  }

  if (Array.isArray(db.products)) {
    db.products = db.products.map((p, idx) => {
      const has = p && typeof p.createdAt === 'string' && toIso(p.createdAt);
      const createdAt = has || new Date(baseProducts + idx * 60_000).toISOString();
      return { ...p, createdAt };
    });
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log('createdAt populated for', (db.users || []).length, 'users and', (db.products || []).length, 'products');
}

main();


