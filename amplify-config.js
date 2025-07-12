// Ten plik zastępuje potrzebę importowania aws-exports.js jako modułu.
// Skopiuj i wklej tutaj całą zawartość swojego oryginalnego pliku `aws-exports.js`.

const awsExports = {
  // Te wartości są wymagane do poprawnego działania Amplify z Cognito.
  // Znajdziesz je w konsoli AWS w usłudze Cognito.
  "aws_project_region": "eu-north-1",
  "aws_cognito_region": "eu-north-1",
  "aws_user_pools_id": "eu-north-1_3pvC4DEG1",
  "aws_user_pools_web_client_id": "22j935nr3cusdmb2vshjrimvj8",
  "oauth": {}, // Ten obiekt jest często wymagany, nawet jeśli jest pusty.
  // Jeśli używasz Identity Pools, dodaj również ten klucz:
  // "aws_cognito_identity_pool_id": "eu-north-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
};

// Udostępniamy konfigurację globalnie dla innych skryptów.
window.aws_exports = awsExports;