/**
 * Conta.gs — dados pessoais e troca de senha.
 */

function getMyProfile(token) {
  return requireSession_(token);
}

function updateMyProfile(token, patch) {
  const user = requireSession_(token);
  const allowed = [
    "full_name", "phone", "address_street", "address_number", "address_complement",
    "address_district", "address_city", "address_state", "address_zip", "cpf",
  ];
  const clean = {};
  allowed.forEach(function (key) { if (patch[key] !== undefined) clean[key] = patch[key]; });
  updateRecord_("Usuarios", user.id, clean);
  return true;
}

function changeMyPassword(token, newPassword) {
  const user = requireSession_(token);
  if (!newPassword || newPassword.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  const salt = newId_();
  updateRecord_("Usuarios", user.id, { salt: salt, password_hash: hashPassword_(newPassword, salt) });
  return true;
}
