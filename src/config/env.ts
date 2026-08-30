function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Definila en .env.local (ver .env.local.example).`,
    );
  }
  return value;
}

export const env = {
  get iolUsername() {
    return requireEnv("IOL_USERNAME");
  },
  get iolPassword() {
    return requireEnv("IOL_PASSWORD");
  },
};
