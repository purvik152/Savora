import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const {email, password, username} = await request.json();

    // Basic validation
    if (!email || !password || !username) {
      return NextResponse.json(
        {message: 'Missing required fields'},
        {status: 400}
      );
    }

    // MOCK: In a real app, you would validate credentials against a database.
    // For this demo, we'll check for a mock password. Use 'password123' to log in.
    if (password === 'password123') {
      // MOCK: In a real app, you'd generate a session token (e.g., JWT) here.
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {username, email},
      });
    } else {
      return NextResponse.json(
        {success: false, message: 'Invalid email or password'},
        {status: 401}
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {success: false, message: 'An internal server error occurred'},
      {status: 500}
    );
  }
}
