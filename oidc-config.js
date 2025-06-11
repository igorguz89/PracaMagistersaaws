//nie ruszac za wszelka cene bo sie popsuje
import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts@2.0.3/+esm";
// reszte kopiowac z cognito quicksetup
const cognitoAuthConfig = {
    authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_3pvC4DEG1",
    client_id: "22j935nr3cusdmb2vshjrimvj8",
    redirect_uri: "https://main.d1o7orvs7bwkpi.amplifyapp.com/PanelUser.html",
    response_type: "code",
    scope: "email openid phone"
};

// create a UserManager instance
export const userManager = new UserManager({
    ...cognitoAuthConfig,
});

export async function signOutRedirect () {
    const clientId = "22j935nr3cusdmb2vshjrimvj8";
    const logoutUri = "https://main.d1o7orvs7bwkpi.amplifyapp.com/index.html";
    const cognitoDomain = "https://eu-north-13pvc4deg1.auth.eu-north-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
