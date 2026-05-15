import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple in-memory rate limiting
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();

  const attempt = loginAttempts.get(ip);
  if (attempt && attempt.count >= MAX_ATTEMPTS && (now - attempt.lastAttempt < LOCKOUT_TIME)) {
    return NextResponse.json({ 
      success: false, 
      error: `Too many failed attempts. Please try again in ${Math.ceil((LOCKOUT_TIME - (now - attempt.lastAttempt)) / 60000)} minutes.` 
    }, { status: 429 });
  }

  try {
    const { password } = await request.json();
    const masterPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === masterPassword) {
      // Reset attempts on success
      loginAttempts.delete(ip);
      
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return NextResponse.json({ success: true });
    }

    // Increment attempts on failure
    const count = (attempt?.count || 0) + 1;
    loginAttempts.set(ip, { count, lastAttempt: now });

    return NextResponse.json({ 
      success: false, 
      error: `Invalid password. ${MAX_ATTEMPTS - count} attempts remaining.` 
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
