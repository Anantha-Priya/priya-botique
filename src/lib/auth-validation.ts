import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
    email: emailSchema,
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  phone: z.string().trim().max(30, "Phone number is too long."),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30, "Phone number is too long."),
  line1: z.string().trim().min(3, "Enter address line 1."),
  line2: z.string().trim().max(200, "Address line 2 is too long."),
  city: z.string().trim().min(2, "Enter your city."),
  state: z.string().trim().min(2, "Enter your state."),
  postalCode: z.string().trim().min(4, "Enter a valid postal code.").max(12, "Postal code is too long."),
  country: z.string().trim().min(2, "Enter your country."),
  isDefault: z.boolean(),
});
