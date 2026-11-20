import { adminDb, PanelError } from "./admin-db.server";

const SESSION = "__Host-gameland_admin";
const SESSION_SECONDS = 60 * 60 * 12;
const HASH_ROUNDS = 600_000;

type Account = {
  id: string;
  username: string;
  name: string;
  role: "dono" | "funcionario";
  must_change_password: boolean;
};

const encode = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const decode = (hex: string) =>
  Uint8Array.from(hex.match(/../g) ?? [], (part) => parseInt(part, 16));
const random = (byteCount: number) => encode(crypto.getRandomValues(new Uint8Array(byteCount)));
const hashToken = async (token: string) =>
  encode(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))));

async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return encode(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt: decode(salt), iterations: HASH_ROUNDS },
        key,
        256,
      ),
    ),
  );
}

export function usernameFrom(value: unknown) {
  const username = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[a-z0-9._-]{3,40}$/.test(username))
    throw new PanelError(
      "Use um usuário de 3 a 40 caracteres, com letras, números, ponto, hífen ou sublinhado.",
    );
  return username;
}

export async function passwordHash(value: unknown) {
  if (typeof value !== "string" || value.length < 12 || value.length > 128) {
    throw new PanelError("Use uma senha de 12 a 128 caracteres.");
  }
  const salt = random(16);
  return `${salt}:${await derive(value, salt)}`;
}

async function passwordMatches(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = await derive(password, salt);
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function sessionToken(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${SESSION}=([a-f0-9]{64})(?:;|$)`))?.[1];
  return token ?? null;
}

export function sessionCookie(token = "", maxAge = 0) {
  return `${SESSION}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export async function readAccount(request: Request): Promise<Account | null> {
  const token = sessionToken(request);
  if (!token) return null;
  const db = adminDb();
  const [account] = await db`
    select a.id, a.username, a.name, a.role, a.must_change_password
    from admin_sessions s join admin_accounts a on a.id = s.account_id
    where s.token_hash = ${await hashToken(token)} and s.expires_at > now() and a.active
  `;
  return (account as Account | undefined) ?? null;
}

export async function login(username: string, password: unknown) {
  const bad = new PanelError("Usuário ou senha inválidos.", 401);
  if (typeof password !== "string" || !password || password.length > 128) throw bad;

  const db = adminDb();
  const [account] = await db`
    select id, password_hash from admin_accounts where username = ${username} and active
  `;
  if (!account) throw bad;
  const [limit] = await db`
    insert into admin_login_attempts (account_id, window_start, attempts)
    values (${account["id"]}, now(), 1)
    on conflict (account_id) do update
    set window_start = case when admin_login_attempts.window_start < now() - interval '15 minutes' then now() else admin_login_attempts.window_start end,
        attempts = case when admin_login_attempts.window_start < now() - interval '15 minutes' then 1 else least(admin_login_attempts.attempts + 1, 9) end
    returning attempts
  `;
  if (Number(limit?.["attempts"]) > 8)
    throw new PanelError("Muitas tentativas. Tente novamente em 15 minutos.", 429);
  if (!(await passwordMatches(password, String(account["password_hash"])))) throw bad;

  const token = random(32);
  const tokenHash = await hashToken(token);
  const first = await db`
    insert into admin_sessions (token_hash, account_id, expires_at)
    select ${tokenHash}, id, now() + interval '12 hours' from admin_accounts
    where id = ${account["id"]} and active and password_hash = ${account["password_hash"]}
    returning account_id
  `;
  if (!first.length) throw bad;
  await db`delete from admin_login_attempts where account_id = ${account["id"]}`;
  return sessionCookie(token, SESSION_SECONDS);
}

export async function logout(request: Request) {
  const token = sessionToken(request);
  if (token) {
    const db = adminDb();
    await db`delete from admin_sessions where token_hash = ${await hashToken(token)}`;
  }
}

export async function changePassword(account: Account, value: unknown, current: unknown) {
  const db = adminDb();
  const [old] =
    await db`select password_hash from admin_accounts where id = ${account.id} and active`;
  if (!old) throw new PanelError("Entre novamente para trocar sua senha.", 401);
  const previousHash = String(old["password_hash"]);
  if (
    !account.must_change_password &&
    (typeof current !== "string" ||
      current.length > 128 ||
      !(await passwordMatches(current, previousHash)))
  ) {
    throw new PanelError("A senha atual está incorreta.", 403);
  }
  if (
    typeof value === "string" &&
    value.length <= 128 &&
    (await passwordMatches(value, previousHash))
  ) {
    throw new PanelError("Escolha uma senha diferente da atual.");
  }
  const hash = await passwordHash(value);
  const updated = await db`
    with changed as (
      update admin_accounts set password_hash = ${hash}, must_change_password = false
      where id = ${account.id} and active and password_hash = ${previousHash} returning id
    ), cleared as (
      delete from admin_sessions where account_id in (select id from changed)
    )
    select id from changed
  `;
  if (!updated.length) throw new PanelError("Entre novamente para trocar sua senha.", 401);
}
