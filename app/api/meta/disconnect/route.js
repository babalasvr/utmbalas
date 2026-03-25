export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function DELETE() {
  db.prepare('DELETE FROM meta_tokens').run();
  return NextResponse.json({ ok: true });
}
