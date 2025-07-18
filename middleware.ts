import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const blockedBots = [
   'Bingbot', 'Slurp', 'YandexBot', 'DuckDuckBot', 'Baido', 'BingPreview'
  ];

  const isBot = blockedBots.some((bot) => userAgent.includes(bot));

  if (isBot) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
