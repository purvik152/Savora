
import {NextResponse} from 'next/server';
import {findUserByEmail, type User} from '@/lib/auth-data';

// Hardcoded user data for demonstration
const users: User[] = [
    {
        uid: '1',
        email: 'user@example.com',
        password: 'password123',
        displayName: 'Test User',
    },
    {
        uid: '2',
        email: 'admin@savora.com',
        password: 'password123',
        displayName: 'Admin User',
    }
];

export async function POST(request: Request) {
  try {
    const {email, password} = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {success: false, message: 'Email and password are required.'},
        {status: 400}
      );
    }
    
    // In a real app, you'd find the user in a database
    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        {success: false, message: 'Invalid email or password.'},
        {status: 401}
      );
    }

    // In a real app, you'd compare hashed passwords
    if (user.password !== password) {
      return NextResponse.json(
        {success: false, message: 'Invalid email or password.'},
        {status: 401}
      );
    }

    // Don't send the password back to the client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: userWithoutPassword,
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {success: false, message: 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}
