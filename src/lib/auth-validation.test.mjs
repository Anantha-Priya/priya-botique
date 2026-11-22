import assert from "node:assert/strict";
import test from "node:test";
import {
  addressSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from "./auth-validation.ts";

test("login validation requires an email and password", () => {
  assert.equal(loginSchema.safeParse({ email: "customer@example.com", password: "secret" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "bad", password: "" }).success, false);
});

test("registration validation requires matching strong passwords", () => {
  assert.equal(registerSchema.safeParse({
    fullName: "Priya Customer",
    email: "customer@example.com",
    password: "strongpass",
    confirmPassword: "strongpass",
  }).success, true);
  assert.equal(registerSchema.safeParse({
    fullName: "Priya",
    email: "customer@example.com",
    password: "strongpass",
    confirmPassword: "different",
  }).success, false);
});

test("profile validation trims name and allows an empty optional phone", () => {
  assert.deepEqual(profileSchema.parse({ fullName: "  Priya  ", phone: "" }), {
    fullName: "Priya",
    phone: "",
  });
});

test("address validation requires customer-owned fields and postal details", () => {
  assert.equal(addressSchema.safeParse({
    fullName: "Priya",
    phone: "9876543210",
    line1: "12 Main Road",
    line2: "",
    city: "Chennai",
    state: "Tamil Nadu",
    postalCode: "600001",
    country: "India",
    isDefault: true,
  }).success, true);
  assert.equal(addressSchema.safeParse({
    fullName: "P",
    phone: "123",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  }).success, false);
});
