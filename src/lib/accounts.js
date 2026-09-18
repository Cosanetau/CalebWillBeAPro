export const LOGIN_EMAIL_DOMAIN = "login.cwbp.cosa.net.au";

export const ACCOUNTS = [
  { username: "Caleb", role: "caleb" },
  { username: "Nix", role: "nutritionist" },
];

export function normalizeUsername(username) {
  return String(username || "").trim();
}

export function usernameToEmail(username) {
  return `${normalizeUsername(username).toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
}

export function roleForUsername(username) {
  return normalizeUsername(username).toLowerCase() === "nix" ? "nutritionist" : "caleb";
}

export function loginFieldError({ username, password }) {
  if (!normalizeUsername(username)) return "Enter your username.";
  if (!String(password || "")) return "Enter your password.";
  return "";
}
