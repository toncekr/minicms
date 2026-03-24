const defaultUrl = "http://localhost:3000";

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const siteConfig = {
  name: "MiniCMS",
  description: "A lightweight publishing platform for writing, organizing, and sharing articles.",
  url: stripTrailingSlash(
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? defaultUrl,
  ),
};
