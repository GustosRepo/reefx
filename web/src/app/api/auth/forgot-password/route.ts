import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, getPasswordResetEmailHtml, getPasswordResetEmailText } from "@/utils/email";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if user exists (using admin API)
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      // Still return success for security (don't reveal if user exists)
      return NextResponse.json(
        { message: "If an account with that email exists, we sent a reset link." },
        { status: 200 }
      );
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, we sent a reset link." },
        { status: 200 }
      );
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store the reset token in user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
    });

    if (updateError) {
      console.error("Error storing reset token:", updateError);
      return NextResponse.json(
        { error: "An error occurred. Please try again." },
        { status: 500 }
      );
    }

    // Create the reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: "Reset Your Password - REEFXONE",
      html: getPasswordResetEmailHtml(resetUrl),
      text: getPasswordResetEmailText(resetUrl),
    });

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
