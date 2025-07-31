import { userManager } from "./oidc-config.js";
import { initializeUserPanel } from "./script.js";
import { initializeTemplatesPanel } from "./templates.js";

/**
 * Wyświetla informacje o zalogowanym użytkowniku w odpowiednich elementach na stronie.
 * @param {import('oidc-client-ts').User} user Obiekt użytkownika z oidc-client-ts
 */
function displayUserInfo(user) {
  // Ta funkcja jest bezpieczna - jeśli element nie istnieje, nic się nie stanie.
  const emailEl = document.getElementById("email");
  const accessTokenEl = document.getElementById("access-token");
  const idTokenEl = document.getElementById("id-token");

  if (emailEl) emailEl.textContent = user.profile?.email ?? "Brak danych";
  if (accessTokenEl) accessTokenEl.textContent = user.access_token;
  if (idTokenEl) idTokenEl.textContent = user.id_token;
}

async function handleAuthentication() {
  try {
    // Sprawdź, czy w URL-u jest parametr 'code', co oznacza powrót z logowania
    if (window.location.search.includes("code=")) {
      // Biblioteka OIDC przetwarza kod i wymienia go na tokeny.
      // To jest kluczowy moment, na który trzeba poczekać.
      await userManager.signinRedirectCallback();

      // Po pomyślnym przetworzeniu, czyścimy URL z parametrów OIDC,
      // aby uniknąć problemów przy odświeżaniu strony.
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Teraz, gdy proces logowania na pewno się zakończył,
    // możemy bezpiecznie sprawdzić, czy użytkownik jest zalogowany.
    const user = await userManager.getUser();

    if (user && !user.expired) {
      // Użytkownik jest uwierzytelniony!
      console.log("Użytkownik uwierzytelniony, inicjalizacja strony...");

      // Wyświetl informacje o użytkowniku (jeśli elementy istnieją na stronie)
      displayUserInfo(user);

      // Sprawdź, na której stronie jesteśmy i zainicjuj odpowiedni panel.
      if (document.getElementById("userTableBody")) {
        console.log("Inicjalizacja panelu użytkowników.");
        initializeUserPanel();
      } else if (document.getElementById("templateTableBody")) {
        console.log("Inicjalizacja panelu szablonów.");
        initializeTemplatesPanel();
      }
    } else {
      // Jeśli nie ma sesji (np. użytkownik wszedł bezpośrednio na URL),
      // przekieruj go do logowania.
      console.log("Brak aktywnej sesji, przekierowanie do logowania.");
      await userManager.signinRedirect();
    }
  } catch (error) {
    console.error("Błąd podczas procesu uwierzytelniania:", error);
    alert("Wystąpił krytyczny błąd logowania. Proszę spróbować ponownie.");
    await userManager.signinRedirect(); // Przekieruj do logowania w razie błędu
  }
}

document.addEventListener("DOMContentLoaded", handleAuthentication);