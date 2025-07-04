import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const {email, password} = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        {message: 'Missing required fields'},
        {status: 400}
      );
    }

    // MOCK: In a real app, you would create a new user in your database.
    // Here, we'll just simulate a successful sign-up.
    console.log(`New user signed up: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {email},
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      {success: false, message: 'An internal server error occurred'},
      {status: 500}
    );
  }
}
