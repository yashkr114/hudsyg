// Central place for app-wide constants

export const COMMON_DASHBOARD_BG_IMAGE = "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1500&q=80";
export const LOGIN_PAGE_BG_IMAGE = "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3";
export const FOOTER_TEXT = "TechM Portal. All rights reserved.";

// Password must be 8-64 chars, 1+ uppercase, 1+ lowercase, 1+ digit, 1+ special, no whitespace
export const COMMON_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[^\s]{8,64}$/;
export const COMMON_PASSWORD_RULES = [
  "8–12 characters minimum, 64 maximum",
  "At least 1 uppercase letter",
  "At least 1 lowercase letter",
  "At least 1 digit",
  "At least 1 special character (@#$%&*! etc)",
  "No whitespace allowed"

];
export const APP_NAME ="OATS";
export const APP_NAME_FULL = "Onboarding and Access Tracking System";
