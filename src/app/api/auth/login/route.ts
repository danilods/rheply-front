import { NextRequest, NextResponse } from "next/server";

// Mock users for development
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@rheply.com",
    password: "admin123",
    fullName: "Admin RHeply",
    role: "admin" as const,
    companyName: "RHeply",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "recruiter@acme.com",
    password: "recruiter123",
    fullName: "Maria Recrutadora",
    role: "recruiter" as const,
    companyName: "Acme Corp",
    createdAt: new Date().toISOString(),
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Find user
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
