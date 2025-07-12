// Ten plik przechowuje konfigurację dla Twojego dostawcy tożsamości (np. Cognito).
// Zastąp poniższe wartości swoimi rzeczywistymi danymi.

// Ustawiamy konfigurację jako globalną zmienną, aby była dostępna w innych skryptach.
window.oidcSettings = {
  // ZASTĄP: Adres URL Twojego dostawcy tożsamości, np. https://cognito-idp.eu-north-1.amazonaws.com/YOUR_USER_POOL_ID
  // Usunięto spację na początku adresu
  authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_3pvC4DEG1",
  // ZASTĄP: ID klienta (Client ID) z Twojej puli użytkowników Cognito.
  // UWAGA: Ten format (UUID) wygląda niepoprawnie dla Cognito. Client ID w Cognito to zazwyczaj ciąg alfanumeryczny.
  client_id: "22j935nr3cusdmb2vshjrimvj8", // Upewnij się, że to jest poprawny Client ID
  // Adres, na który użytkownik zostanie przekierowany po zalogowaniu.
  redirect_uri: window.location.origin + "/PanelUser.html",
  // Adres, na który użytkownik zostanie przekierowany po wylogowaniu.
  post_logout_redirect_uri: window.location.origin + "/index.html",
  response_type: "code",
  scope: "openid profile email", // Standardowe uprawnienia
};