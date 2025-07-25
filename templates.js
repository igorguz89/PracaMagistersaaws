import { userManager, signOutRedirect } from "./main.js";
document.addEventListener("DOMContentLoaded", () => {
  const templateFileUpload = document.getElementById("templateFileUpload");
  const uploadTemplateBtn = document.getElementById("uploadTemplateBtn");
  const uploadStatus = document.getElementById("uploadStatus");
  const templateTableBody = document.getElementById("templateTableBody");

  // Funkcja pobierajaca token zalogowanego uzytkownika
  const getAuthToken = async () => {
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

  // --- Function to handle file upload ---
  uploadTemplateBtn.addEventListener("click", async () => {
    const file = templateFileUpload.files[0];
    if (!file) {
      uploadStatus.textContent = "Proszę wybrać plik HTML do wgrania.";
      uploadStatus.style.color = "red";
      return;
    }

    if (file.type !== "text/html") {
      uploadStatus.textContent = "Proszę wgrać plik HTML (.html).";
      uploadStatus.style.color = "red";
      return;
    }

    uploadStatus.textContent = "Wgrywanie pliku...";
    uploadStatus.style.color = "blue";

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Content = e.target.result.split(",")[1];
      const fileName = file.name;

      try {
        const idToken = await getAuthToken();

        // --- that triggers a Lambda function to handle S3 uploads.          ---
        const UPLOAD_API_URL =
          "https://gie4hdwqw8.execute-api.eu-north-1.amazonaws.com/prod/POSTTAMPLATE";

        const response = await fetch(UPLOAD_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json", // Ważne: wysyłamy JSON
          },
          body: JSON.stringify({
            // Wysyłamy JSON
            fileName: fileName,
            fileContent: base64Content,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          uploadStatus.textContent = `Plik ${file.name} wgrany pomyślnie!`;
          uploadStatus.style.color = "green";
          console.log("Upload successful:", result);
          loadTemplates(); // Refresh the list of templates
        } else {
          const errorData = await response.json();
          uploadStatus.textContent = `Błąd podczas wgrywania: ${
            errorData.message || response.statusText
          }`;
          uploadStatus.style.color = "red";
          console.error("Upload failed:", errorData);
        }
      } catch (error) {
        uploadStatus.textContent = `Wystąpił błąd sieci lub autoryzacji: ${error.message}`;
        uploadStatus.style.color = "red";
        console.error("Network/Auth error during upload:", error);
      }
    };
    reader.readAsDataURL(file);
  });

  // --- Function to load and display existing templates ---
  const loadTemplates = async () => {
    templateTableBody.innerHTML =
      '<tr><td colspan="4">Ładowanie szablonów...</td></tr>';
    try {
      const idToken = await getAuthToken();

      // --- IMPORTANT: This URL needs to point to your API Gateway endpoint ---
      // --- that triggers a Lambda function to list S3 objects.          ---
      const LIST_TEMPLATES_API_URL =
        "https://gie4hdwqw8.execute-api.eu-north-1.amazonaws.com/prod/GETTEMPLATE";

      const response = await fetch(LIST_TEMPLATES_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const templates = await response.json(); // Assuming your Lambda returns a list of template objects
        templateTableBody.innerHTML = ""; // Clear loading message

        if (templates && templates.length > 0) {
          templates.forEach((template) => {
            const row = templateTableBody.insertRow();
            // Assuming template object has properties like 'Key', 'Size', 'LastModified' from S3 ListObjectsV2
            const fileName = template.Key.split("/").pop(); // Get just the file name
            const lastModified =
              new Date(template.LastModified).toLocaleDateString() +
              " " +
              new Date(template.LastModified).toLocaleTimeString();
            const fileSizeKB = (template.Size / 1024).toFixed(2); // Size in KB

            row.innerHTML = `
                            <td>${fileName}</td>
                            <td>${fileSizeKB} KB</td>
                            <td>${lastModified}</td>
                            <td>
                                <button data-key="${template.Key}" class="delete-template-btn">Usuń</button>
                            </td>
                        `;
          });
          // Add event listeners for delete buttons
          document
            .querySelectorAll(".delete-template-btn")
            .forEach((button) => {
              button.addEventListener("click", handleDeleteTemplate);
            });
        } else {
          templateTableBody.innerHTML =
            '<tr><td colspan="4">Brak szablonów.</td></tr>';
        }
      } else {
        const errorData = await response.json();
        templateTableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Błąd ładowania szablonów: ${
          errorData.message || response.statusText
        }</td></tr>`;
        console.error("Failed to load templates:", errorData);
      }
    } catch (error) {
      templateTableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Wystąpił błąd sieci lub autoryzacji podczas ładowania szablonów: ${error.message}</td></tr>`;
      console.error("Network/Auth error during template load:", error);
    }
  };

  // Initial load of templates when the page loads

  // --- Funkcja do obsługi usuwania szablonów ---
  const handleDeleteTemplate = async (event) => {
    const templateKey = event.target.dataset.key;
    if (!confirm(`Czy na pewno chcesz usunąć szablon "${templateKey}"?`)) {
      return;
    }

    try {
      const idToken = await getAuthToken();

      const DELETE_TEMPLATE_API_URL = "https://gie4hdwqw8.execute-api.eu-north-1.amazonaws.com/prod/DELETETEMPLATE"

      const response = await fetch(DELETE_TEMPLATE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
                keyToDelete: templateKey,
            }),
      });

      if (response.ok) {
        alert(`Szablon ${templateKey} usunięty pomyślnie.`);
        loadTemplates();
      } else {
        const errorData = await response.json();
        alert(
          `Błąd podczas usuwania szablonu: ${
            errorData.message || response.statusText
          }`
        );
        console.error("Delete failed:", errorData);
      }
    } catch (error) {
      alert(
        `Wystąpił błąd sieci lub autoryzacji podczas usuwania: ${error.message}`
      );
      console.error("Network/Auth error during template deletion:", error);
    }
  };

  // Inicjalne ładowanie szablonów po załadowaniu strony
  loadTemplates();
});
