
import {NextResponse} from 'next/server';
import { findUserByEmail, addUser, type User } from '@/lib/auth-data';


export async function POST(request: Request) {
  try {
    const {username, email, password} = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        {success: false, message: 'Username, email, and password are required.'},
        {status: 400}
      );
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
        return NextResponse.json(
            {success: false, message: 'An account with this email already exists.'},
            {status: 409} // Conflict
        );
    }

    const newUser: User = {
        uid: Date.now().toString(),
        displayName: username,
        email: email,
        password: password, // In a real app, this should be hashed!
    };
    
    addUser(newUser);

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'User created successfully!',
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {success: false, message: 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}
