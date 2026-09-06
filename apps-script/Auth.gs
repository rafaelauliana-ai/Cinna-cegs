/**
 * Auth.gs
 * ----------------------------------------------------------------------
 * Cadastro, login, sessão (token) e promoção de papel (master/joiner).
 * Funções sem "_" no final são chamadas pelo cliente via google.script.run.
 */

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;

function hashPassword_(password, salt) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + ":" + salt);
  return bytes.map((b) => ("0" + (b & 0xff).toString(16)).slice(-2)).join("");
}

function sanitizeUser_(user) {
  if (!user) return null;
  const clean = Object.assign({}, user);
  delete clean.password_hash;
  delete clean.salt;
  return clean;
}

/** Cadastro de novo joiner. Retorna { user, token }. */
function signup(payload) {
  const username = String(payload.username || "").trim().replace(/^@/, "").toLowerCase();
  const fullName = String(payload.fullName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const phone = String(payload.phone || "").trim();
  const password = String(payload.password || "");

  if (!USERNAME_REGEX.test(username)) {
    throw new Error('O @ deve ter 3-30 caracteres: letras minúsculas, números, "." ou "_".');
  }
  if (!fullName) throw new Error("Informe seu nome.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("E-mail inválido.");
  if (password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  if (!payload.acceptedRules) {
    throw new Error("Você precisa aceitar as regras da comunidade para continuar.");
  }

  const existing = findWhere_("Usuarios", (u) => u.username === username || u.email === email);
  if (existing.length > 0) {
    throw new Error("Já existe uma conta com esse @ ou e-mail.");
  }

  const salt = newId_();
  const user = insertRecord_("Usuarios", {
    username: username,
    full_name: fullName,
    email: email,
    phone: phone,
    password_hash: hashPassword_(password, salt),
    salt: salt,
    role: "joiner",
    accepted_rules_at: nowIso_(),
  });

  const token = createSession_(user.id);
  return { user: sanitizeUser_(user), token: token };
}

/** Login por @ + senha. Retorna { user, token }. */
function login(username, password) {
  const clean = String(username || "").trim().replace(/^@/, "").toLowerCase();
  const user = findWhere_("Usuarios", (u) => u.username === clean)[0];

  if (!user || hashPassword_(String(password || ""), user.salt) !== user.password_hash) {
    throw new Error("Usuário ou senha inválidos.");
  }

  const token = createSession_(user.id);
  return { user: sanitizeUser_(user), token: token };
}

function createSession_(userId) {
  const token = newId_();
  insertRecord_("Sessions", {
    token: token,
    user_id: userId,
    created_at: nowIso_(),
    expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  });
  return token;
}

/** Valida um token de sessão e devolve o usuário (sem dados sensíveis) ou null. */
function getSessionUser_(token) {
  if (!token) return null;
  const session = findWhere_("Sessions", (s) => s.token === token)[0];
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  const user = findById_("Usuarios", session.user_id);
  return user ? sanitizeUser_(user) : null;
}

/** Usado no início de toda função protegida. Lança erro se a sessão for inválida. */
function requireSession_(token) {
  const user = getSessionUser_(token);
  if (!user) throw new Error("SESSAO_INVALIDA");
  return user;
}

function requireMaster_(token) {
  const user = requireSession_(token);
  if (user.role !== "master") throw new Error("Acesso restrito à administradora.");
  return user;
}

/** Chamada pelo cliente ao carregar a página, pra restaurar a sessão salva no navegador. */
function checkSession(token) {
  return getSessionUser_(token);
}

function logout(token) {
  deleteWhere_("Sessions", (s) => s.token === token);
  return true;
}
