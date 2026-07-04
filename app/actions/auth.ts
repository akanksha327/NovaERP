"use server";

import { prisma } from "@/lib/prisma";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    // 1. Test database connection & Auto-seed test user if empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.user.create({
        data: {
          email: "admin@smarterp.com",
          password: "password123",
          name: "Admin User",
        },
      });
    }

    // 2. Query user from database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // 3. Verify password
    if (user.password !== password) {
      return { success: false, error: "Invalid email or password." };
    }

    return { 
      success: true, 
      message: "Successfully authenticated!", 
      user: { id: user.id, email: user.email, name: user.name } 
    };

  } catch (error: any) {
    console.error("Database connection error:", error);
    return { 
      success: false, 
      error: `Database connection failed. Ensure your PostgreSQL server is running. Detail: ${error.message || error}` 
    };
  }
}
