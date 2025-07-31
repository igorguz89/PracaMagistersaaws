import { userManager } from "./oidc-config.js";

export const getAuthToken = async () => {
  const user = await userManager.getUser();
  if (user && !user.expired) {
    return user.id_token;
  }
  // Jeśli nie ma użytkownika lub sesja wygasła, przekieruj do logowania.
  alert(
    "Twoja sesja wygasła lub nie jesteś zalogowany. Proszę zalogować się ponownie."
  );
  await userManager.signinRedirect();
  throw new Error("Użytkownik nie jest uwierzytelniony lub sesja wygasła.");
};