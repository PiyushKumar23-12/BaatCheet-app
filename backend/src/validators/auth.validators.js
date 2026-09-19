import {z} from "zod";
export const signupSchema = z.object({
    body: z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
});

export const updateProfileSchema = z.object({
    body: z.object({
        profilePic: z.string().min(1, "Profile pic is required")
    })
});