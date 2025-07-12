// Ten plik przechowuje konfigurację dla Twojego dostawcy tożsamości (np. Cognito).
// Zastąp poniższe wartości swoimi rzeczywistymi danymi.

// Ustawiamy konfigurację jako globalną zmienną, aby była dostępna w innych skryptach.
window.oidcSettings = {
  // ZASTĄP: Adres URL Twojego dostawcy tożsamości, np. https://cognito-idp.eu-north-1.amazonaws.com/YOUR_USER_POOL_ID
  authority: " https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_3pvC4DEG1",
  // ZASTĄP: ID klienta (Client ID) z Twojej puli użytkowników Cognito.
  client_id: "40bcd90c-6071-700f-601b-e1a9b3dc0e3b",
  // Adres, na który użytkownik zostanie przekierowany po zalogowaniu.
  redirect_uri: window.location.origin + "/PanelUser.html",
  // Adres, na który użytkownik zostanie przekierowany po wylogowaniu.
  post_logout_redirect_uri: window.location.origin + "/index.html",
  response_type: "code",
  scope: "openid profile email", // Standardowe uprawnienia
};