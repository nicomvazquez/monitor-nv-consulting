"use server";

import { signIn, signOut } from "@/auth";

export async function iniciarSesionGoogle() {
  await signIn("google");
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/" });
}
