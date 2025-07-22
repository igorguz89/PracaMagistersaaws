import { userManager, signOutRedirect } from "./main.js";   
// Używamy DOMContentLoaded, aby mieć pewność, że cały HTML jest załadowany, zanim uruchomimy skrypt.
document.addEventListener("DOMContentLoaded", () => {
  // Pobieramy elementy, które są specyficzne dla PanelUser.html
  const addBtn = document.getElementById("addBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const modal = document.getElementById("userModal");
  const closeModalBtn = document.getElementById("closeModal");
  const saveUserBtn = document.getElementById("saveUser");
  const tbody = document.getElementById("userTableBody");
  const templateFileUpload = document.getElementById('templateFileUpload');
  const uploadTemplateBtn = document.getElementById('uploadTemplateBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  const templateTableBody = document.getElementById('templateTableBody');
  
  

  // Zmienna do przechowywania listy użytkowników (jako "single source of truth")
  let userList = [];


  // --- Funkcje pomocnicze ---

  // Funkcja do renderowania pojedynczego wiersza w tabeli
  const renderUserRow = (user) => {
    const row = document.createElement("tr");
    // Używamy atrybutu data-* do przechowywania unikalnego identyfikatora (email)
    row.setAttribute("data-email", user.email);
    row.innerHTML = `
      <td><input type="checkbox" class="rowCheckbox"></td>
      <td>${user.firstName}</td>
      <td>${user.lastName}</td>
      <td>${user.email}</td>
    `;
    tbody.appendChild(row);
  };

  // Funkcja do ponownego renderowania całej tabeli na podstawie userList
  const renderTable = () => {
    tbody.innerHTML = ""; // Wyczyść tabelę
    userList.forEach((user) => renderUserRow(user));
  };

// Funkcja pobierajaca token zalogowanego uzytkownika
const getAuthToken = async () => {
    const user = await userManager.getUser();
    if (user && !user.expired) {
      return user.id_token;
    }
    // Jeśli nie ma użytkownika lub sesja wygasła, przekieruj do logowania.
    alert("Twoja sesja wygasła lub nie jesteś zalogowany. Proszę zalogować się ponownie.");
    await userManager.signinRedirect();
    throw new Error("Użytkownik nie jest uwierzytelniony lub sesja wygasła.");
  };




// --- Logika API ---
  // Funkcja do pobierania wszystkich użytkowników przy ładowaniu strony
    const fetchUsers = async () => {
    const GET_USERS_API_URL = "https://d17qh5vn82.execute-api.eu-north-1.amazonaws.com/GET_DATA/dev";

    try {
        // 2. Przygotuj opcje żądania, dołączając nagłówek autoryzacji
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // 3. Wykonaj uwierzytelnione żądanie do API
        const response = await fetch(GET_USERS_API_URL, requestOptions);

        if (!response.ok) {
            throw new Error(`Błąd HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Otrzymano surowe dane z API:", data);

        if (data.body && typeof data.body === "string") {
            const usersFromApi = JSON.parse(data.body);
            return usersFromApi.map((apiUser) => ({
                firstName: apiUser.Imie,
                lastName: apiUser.Nazwisko,
                email: apiUser.ID,
            }));
        } else {
            throw new Error("Odpowiedź API nie zawierała oczekiwanego pola 'body' w formacie string.");
        }
    } catch (error) {
        console.error("Błąd w fetchUsers:", error);
        // Rzuć błąd dalej, aby został złapany w bloku .catch() przy wywołaniu
        throw error;
    }
  };
  

  // --- Event Listeners (tylko jeśli elementy istnieją) ---

  // Sprawdzamy, czy jesteśmy na stronie PanelUser.html, sprawdzając istnienie przycisku
   // Sprawdzamy, czy jesteśmy na stronie PanelUser.html, sprawdzając istnienie tbody
  if (tbody) {
    // Pobierz i wyświetl użytkowników zaraz po załadowaniu strony
    fetchUsers()
      .then((users) => {
        userList = users; // Zaktualizuj globalną listę użytkowników
        renderTable(); // Wyrenderuj tabelę z pobranymi danymi
        console.log("Lista użytkowników została pomyślnie załadowana.", userList);
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania listy użytkowników:", error);
        alert(
          "Nie udało się pobrać listy użytkowników. Sprawdź konsolę, aby uzyskać więcej informacji."
        );
      });
  }
  
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Zamykanie modala po kliknięciu poza nim
  window.addEventListener("click", (e) => {
    if (e.target == modal) {
      modal.style.display = "none";
    }
  });


// --- Logika API ---

  const callAPI = (user) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email: user.email,
      imie: user.firstName,
      nazwisko: user.lastName,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    return fetch(
      "https://d17qh5vn82.execute-api.eu-north-1.amazonaws.com/POST/dev",
      requestOptions
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`Błąd HTTP! Status: ${response.status}`);
      }
      return response.json(); // Zakładamy, że API zwraca JSON
    });
  };


  if (saveUserBtn) {
    saveUserBtn.addEventListener("click", () => {
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("emailUser").value.trim();

      if (firstName && lastName && email) {
        const newUser = { firstName, lastName, email };

        // 1. Wywołaj API
        callAPI(newUser)
          .then((result) => {
            console.log("Odpowiedź z API:", result);
            let alertMessage;
            try {
              // API Gateway może zwracać odpowiedź jako stringified JSON w polu 'body'
              const bodyContent = JSON.parse(result.body);
              alertMessage =
                bodyContent.message || "Operacja zakończona pomyślnie.";
            } catch (e) {
              // Jeśli parsowanie się nie uda, 'body' może być zwykłym tekstem
              // lub sama odpowiedź jest wiadomością.
              alertMessage =
                result.body || result.message || "Użytkownik zapisany!";
            }
            alert(alertMessage);

            // 2. Jeśli API się powiodło, zaktualizuj stan i UI
            userList.push(newUser);
            renderUserRow(newUser); // Dodaj tylko nowy wiersz

            // 3. Wyczyść formularz i zamknij modal
            document.getElementById("firstName").value = "";
            document.getElementById("lastName").value = "";
            document.getElementById("emailUser").value = "";
            modal.style.display = "none";
          })
          .catch((error) => {
            console.error("Błąd podczas zapisywania użytkownika:", error);
            alert(`Nie udało się zapisać użytkownika: ${error.message}`);
          });
      } else {
        alert("Wszystkie pola są wymagane.");
      }
    });
  }

   


///FUNKCJA DO USUWANIA API
const deleteUsersAPI = async (emailsToDelete) => {
        // 1. Zdefiniuj pełny adres URL swojego endpointu API
        const DELETE_API_URL = "https://d17qh5vn82.execute-api.eu-north-1.amazonaws.com/DeleteUsers/Lambda_Delete_DynamoDB_EmailRecord";

        try {
            // 3. Przygotuj opcje żądania dla `fetch`
            const idToken = await getAuthToken();
            const requestOptions = {
                method: 'POST', // lub 'POST', jeśli Twoje API tego wymaga
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    emails: emailsToDelete
                })
            };

            console.log("Wysyłanie żądania usunięcia na URL:", DELETE_API_URL);
            const response = await fetch(DELETE_API_URL, requestOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Błąd API: ${errorData.message || `Status ${response.status}`}`);
            }

            return response.json(); 
        } catch (error) {
            console.error("Błąd w deleteUsersAPI:", error);
            // Rzuć błąd dalej, aby został złapany w bloku try...catch przycisku
            throw error;
        }
    };

  
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
      const emailsToDelete = [];

      checkboxes.forEach((cb) => {
        const row = cb.closest("tr");
        const email = row.getAttribute("data-email");
        if (email) {
          emailsToDelete.push(email);
        }
      });

      if (emailsToDelete.length > 0) {
        // Dobrą praktyką jest potwierdzenie operacji destrukcyjnej
        if (confirm(`Czy na pewno chcesz usunąć ${emailsToDelete.length} zaznaczonych użytkowników?`)) {
          try {
            // Wywołaj API i poczekaj na odpowiedź
            const result = await deleteUsersAPI(emailsToDelete);

            // --- SUKCES ---
            // Logika poniżej wykona się DOPIERO, gdy API odpowie sukcesem.

            // 1. Zaktualizuj lokalną listę użytkowników
            userList = userList.filter(
              (user) => !emailsToDelete.includes(user.email)
            );

            // 2. Przerenderuj tabelę, aby odzwierciedlić zmiany
            renderTable();

            console.log("Odpowiedź z API:", result);
            alert(result.message || "Użytkownicy zostali pomyślnie usunięci.");

          } catch (error) {
            // --- BŁĄD ---
            // Logika poniżej wykona się tylko, jeśli API zwróci błąd.
            console.error("Błąd podczas usuwania użytkowników:", error);
            // Spróbuj wyciągnąć komunikat o błędzie z odpowiedzi API
            const errorMessage = error.response?.data?.message || error.message || "Wystąpił nieznany błąd.";
            alert(`Nie udało się usunąć użytkowników: ${errorMessage}`);
          }
        }
      } else {
        alert("Zaznacz użytkowników do usunięcia.");
      }
    });
  }
});	


///////////////wgrywanie tamplate
 uploadTemplateBtn.addEventListener('click', async () => {
        const file = templateFileUpload.files[0];
        if (!file) {
            uploadStatus.textContent = 'Proszę wybrać plik HTML do wgrania.';
            uploadStatus.style.color = 'red';
            return;
        }

        if (file.type !== 'text/html') {
            uploadStatus.textContent = 'Proszę wgrać plik HTML (.html).';
            uploadStatus.style.color = 'red';
            return;
        }

        uploadStatus.textContent = 'Wgrywanie pliku...';
        uploadStatus.style.color = 'blue';

        try {
            const idToken = await getAuthToken(); // Get token for authorization
            

            // --- IMPORTANT: This URL needs to point to your API Gateway endpoint ---
            // --- that triggers a Lambda function to handle S3 uploads.          ---
            const UPLOAD_API_URL = 'YOUR_S3_UPLOAD_API_GATEWAY_URL'; // <-- REPLACE THIS

            const formData = new FormData();
            formData.append('templateFile', file); // Append the file to form data
            formData.append('fileName', file.name); // Send file name separately if needed by backend

            const response = await fetch(UPLOAD_API_URL, {
                method: 'POST', // Or PUT, depending on your API Gateway method
                headers: {
                    'Authorization': `Bearer ${idToken}`, // Send authorization token
                    // 'Content-Type': 'multipart/form-data' is usually set automatically by fetch when using FormData
                },
                body: formData, // Send the FormData object
            });

            if (response.ok) {
                const result = await response.json();
                uploadStatus.textContent = `Plik ${file.name} wgrany pomyślnie!`;
                uploadStatus.style.color = 'green';
                console.log('Upload successful:', result);
                loadTemplates(); // Refresh the list of templates
            } else {
                const errorData = await response.json();
                uploadStatus.textContent = `Błąd podczas wgrywania: ${errorData.message || response.statusText}`;
                uploadStatus.style.color = 'red';
                console.error('Upload failed:', errorData);
            }
        } catch (error) {
            uploadStatus.textContent = `Wystąpił błąd sieci lub autoryzacji: ${error.message}`;
            uploadStatus.style.color = 'red';
            console.error('Network/Auth error during upload:', error);
        }
    });

    // --- Function to load and display existing templates ---
    const loadTemplates = async () => {
        templateTableBody.innerHTML = '<tr><td colspan="4">Ładowanie szablonów...</td></tr>';
        try {
            const idToken = await getAuthToken();
            

            // --- IMPORTANT: This URL needs to point to your API Gateway endpoint ---
            // --- that triggers a Lambda function to list S3 objects.          ---
            const LIST_TEMPLATES_API_URL = 'YOUR_S3_LIST_API_GATEWAY_URL'; // <-- REPLACE THIS

            const response = await fetch(LIST_TEMPLATES_API_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                const templates = await response.json(); // Assuming your Lambda returns a list of template objects
                templateTableBody.innerHTML = ''; // Clear loading message

                if (templates && templates.length > 0) {
                    templates.forEach(template => {
                        const row = templateTableBody.insertRow();
                        // Assuming template object has properties like 'Key', 'Size', 'LastModified' from S3 ListObjectsV2
                        const fileName = template.Key.split('/').pop(); // Get just the file name
                        const lastModified = new Date(template.LastModified).toLocaleDateString() + ' ' + new Date(template.LastModified).toLocaleTimeString();
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
                    document.querySelectorAll('.delete-template-btn').forEach(button => {
                        button.addEventListener('click', handleDeleteTemplate);
                    });
                } else {
                    templateTableBody.innerHTML = '<tr><td colspan="4">Brak szablonów.</td></tr>';
                }
            } else {
                const errorData = await response.json();
                templateTableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Błąd ładowania szablonów: ${errorData.message || response.statusText}</td></tr>`;
                console.error('Failed to load templates:', errorData);
            }
        } catch (error) {
            templateTableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Wystąpił błąd sieci lub autoryzacji podczas ładowania szablonów: ${error.message}</td></tr>`;
            console.error('Network/Auth error during template load:', error);
        }
    };

    // --- Function to handle template deletion ---
    const handleDeleteTemplate = async (event) => {
        const templateKey = event.target.dataset.key;
        if (!confirm(`Czy na pewno chcesz usunąć szablon "${templateKey}"?`)) {
            return;
        }

        try {
            const authData = await getAuthTokenAndGroups();
            const idToken = authData.idToken;

            // --- IMPORTANT: This URL needs to point to your API Gateway endpoint ---
            // --- that triggers a Lambda function to delete S3 objects.          ---
            const DELETE_TEMPLATE_API_URL = `YOUR_S3_DELETE_API_GATEWAY_URL/${encodeURIComponent(templateKey)}`; // <-- REPLACE THIS

            const response = await fetch(DELETE_TEMPLATE_API_URL, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                alert(`Szablon ${templateKey} usunięty pomyślnie.`);
                loadTemplates(); // Refresh the list
            } else {
                const errorData = await response.json();
                alert(`Błąd podczas usuwania szablonu: ${errorData.message || response.statusText}`);
                console.error('Delete failed:', errorData);
            }
        } catch (error) {
            alert(`Wystąpił błąd sieci lub autoryzacji podczas usuwania: ${error.message}`);
            console.error('Network/Auth error during template deletion:', error);
        }
    };

    // Initial load of templates when the page loads
    loadTemplates();






