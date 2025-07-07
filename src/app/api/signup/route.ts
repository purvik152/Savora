// This API route has been deprecated.
// Authentication logic is now handled on the client-side
// using localStorage for this prototype.
// See src/components/auth/signup-form.tsx.

import {NextResponse} from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json(
      {success: false, message: 'This API route is deprecated.'},
      {status: 410}
    );
}
