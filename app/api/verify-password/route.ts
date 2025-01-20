import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  
  // Make comparison case-insensitive
  if (password.toUpperCase() === process.env.PASSWORD?.toUpperCase()) {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
} 