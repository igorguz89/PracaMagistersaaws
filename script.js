import { userManager, signOutRedirect } from "./main.js";   
import { apiConfig } from "./api-config.js";
import { getAuthToken } from "./auth.js";

export function initializeUserPanel() {
  const addBtn = document.getElementById("addBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const modal = document.getElementById("userModal");
  const closeModalBtn = document.getElementById("closeModal");
  const saveUserBtn = document.getElementById("saveUser");
  const tbody = document.getElementById("userTableBody");
  
  // Zmienna do przechowywania listy użytkowników 
  let userList = [];


  // --- Funkcje pomocnicze ---

  // Funkcja do renderowania pojedynczego wiersza w tabeli
  const renderUserRow = (user) => {
    const row = document.createElement("tr");
    
    row.setAttribute("data-email", user.email);
    row.innerHTML = `
      <td><input type="checkbox" class="rowCheckbox"></td>
      <td>${user.firstName}</td>
      <td>${user.lastName}</td>
      <td>${user.email}</td>
      <td>${user.status}</td>
    `;
    tbody.appendChild(row);
  };

  // Funkcja do ponownego renderowania całej tabeli na podstawie userList
  const renderTable = () => {
    tbody.innerHTML = ""; // Wyczyść tabelę
    userList.forEach((user) => renderUserRow(user));
  };



// --- Logika API ---
  // Funkcja do pobierania wszystkich użytkowników przy ładowaniu strony
    const fetchUsers = async () => {
    try {
        // 1. Pobierz token uwierzytelniający
        const idToken = await getAuthToken();
        // 2. Przygotuj opcje żądania, dołączając nagłówek autoryzacji
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        };

        // 3. Wykonaj uwierzytelnione żądanie do API
        const response = await fetch(apiConfig.getUsers, requestOptions);

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
                status: apiUser.Status,
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
  

  // Inicjalne pobranie danych. Nie potrzebujemy już warunku `if (tbody)`,
  // ponieważ app-init.js gwarantuje, że ta funkcja jest wywoływana tylko na właściwej stronie.
  fetchUsers()
    .then((users) => {
      userList = users; // Zaktualizuj listę użytkowników
      renderTable(); // Wyrenderuj tabelę z pobranymi danymi
      console.log("Lista użytkowników została pomyślnie załadowana.", userList);
    })
    .catch((error) => {
      console.error("Błąd podczas pobierania listy użytkowników:", error);
      alert("Nie udało się pobrać listy użytkowników. Sprawdź konsolę, aby uzyskać więcej informacji.");
    });
  
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


// --- Logika API --- do zapisywania uzytkownika

  const callAPI = async (user) => {
    const idToken = await getAuthToken();

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({
        email: user.email,
        imie: user.firstName,
        nazwisko: user.lastName,
      }),
    };

    const response = await fetch(apiConfig.postUser, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Jeśli treść nie jest JSON-em
      const errorMessage = errorData.message || `Błąd HTTP! Status: ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  };


  if (saveUserBtn) {
    saveUserBtn.addEventListener("click", () => {
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("emailUser").value.trim();

      if (firstName && lastName && email) {
        const newUser = { firstName, lastName, email , status: 'active'};

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

        try {
            // 3. Przygotuj opcje żądania 
            const idToken = await getAuthToken();
            const requestOptions = {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    emails: emailsToDelete
                })
            };

            console.log("Wysyłanie żądania usunięcia na URL:", apiConfig.deleteUsers);
            const response = await fetch(apiConfig.deleteUsers, requestOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Błąd API: ${errorData.message || `Status ${response.status}`}`);
            }

            return response.json(); 
        } catch (error) {
            console.error("Błąd w deleteUsersAPI:", error);
            
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
        if (confirm(`Czy na pewno chcesz usunąć ${emailsToDelete.length} zaznaczonych użytkowników?`)) {
          try {
          
            const result = await deleteUsersAPI(emailsToDelete);

            // 1. Zaktualizuj lokalną listę użytkowników
            userList = userList.filter(
              (user) => !emailsToDelete.includes(user.email)
            );

            // 2. Przerenderuj tabelę, aby odzwierciedlić zmiany
            renderTable();

            console.log("Odpowiedź z API:", result);
            alert(result.message || "Użytkownicy zostali pomyślnie usunięci.");

          } catch (error) {
            console.error("Błąd podczas usuwania użytkowników:", error);
            const errorMessage = error.response?.data?.message || error.message || "Wystąpił nieznany błąd.";
            alert(`Nie udało się usunąć użytkowników: ${errorMessage}`);
          }
        }
      } else {
        alert("Zaznacz użytkowników do usunięcia.");
      }
    });
  }
}



 

  
