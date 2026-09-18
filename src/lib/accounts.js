export const LOGIN_EMAIL_DOMAIN = "login.cwbp.cosa.net.au";

export const ACCOUNTS = [
  { username: "Caleb", role: "caleb" },
  { username: "Nix", role: "nutritionist" },
];

export function normalizeUsername(username) {
  return String(username || "").trim();
}

export function findAccount(username) {
  const key = normalizeUsername(username).toLowerCase();
  return ACCOUNTS.find((account) => account.username.toLowerCase() === key) || null;
}

export function usernameToEmail(username) {
  return `${normalizeUsername(username).toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
}

export function roleForUsername(username) {
  return findAccount(username)?.role || "caleb";
}

export function loginFieldError({ username, password }) {
  if (!normalizeUsername(username)) return "Put your name in.";
  if (!findAccount(username)) return "It's Caleb or Nix.";
  if (!String(password || "")) return "Put the password in.";
  return "";
}
