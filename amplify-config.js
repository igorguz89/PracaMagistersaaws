// Ten plik zastępuje potrzebę importowania aws-exports.js jako modułu.
// Skopiuj i wklej tutaj całą zawartość swojego oryginalnego pliku `aws-exports.js`.

const awsExports = {
  // ====================================================================
  // PASTE THE CONTENT OF YOUR `aws-exports.js` FILE HERE
  // For example:
   "aws_project_region": "eu-north-1",
   "aws_cognito_region": "eu-north-1",
   "aws_user_pools_id": "eu-north-1_3pvC4DEG1",
  // ... etc.
  // ====================================================================
};

// Udostępniamy konfigurację globalnie dla innych skryptów.
window.aws_exports = awsExports;