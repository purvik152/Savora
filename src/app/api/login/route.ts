
// This API route has been deprecated.
// Authentication logic is now handled via Firebase.
// See src/contexts/AuthContext.tsx.

import {NextResponse} from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json(
      {success: false, message: 'This API route is deprecated.'},
      {status: 410}
    );
}
