import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Token, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return NextResponse.json(
        { error: "An error occurred. Please try again." },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    // Verify the reset token
    const storedToken = user.user_metadata?.reset_token;
    const tokenExpiry = user.user_metadata?.reset_token_expiry;

    if (!storedToken || storedToken !== token) {
      return NextResponse.json(
        { error: "Invalid reset token. Please request a new password reset link." },
        { status: 400 }
      );
    }

    if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new password reset link." },
        { status: 400 }
      );
    }

    // Update the password and clear the reset token
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: password,
      user_metadata: {
        ...user.user_metadata,
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
