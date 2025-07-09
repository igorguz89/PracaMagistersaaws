const addBtn = document.getElementById("addBtn");
const deleteBtn = document.getElementById("deleteBtn");
const modal = document.getElementById("userModal");
const closeModal = document.getElementById("closeModal");
const saveUser = document.getElementById("saveUser");
const tbody = document.getElementById("userTableBody");

// Zmienna do przechowywania listy użytkowników
let userList = [];

addBtn.onclick = () => {
  modal.style.display = "block";
};

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
};

saveUser.onclick = () => {
  const fname = document.getElementById("firstName").value.trim();
  const lname = document.getElementById("lastName").value.trim();
  const email = document.getElementById("emailUser").value.trim();

  if (fname && lname && email) {
    // Dodaj do listy
    const newUser = { firstName: fname, lastName: lname, email: email };
    userList.push(newUser);

    // Dodaj do tabeli
    const row = document.createElement("tr");
    row.innerHTML = `
          <td><input type="checkbox" class="rowCheckbox"></td>
          <td>${fname}</td>
          <td>${lname}</td>
          <td>${email}</td>
        `;
    tbody.appendChild(row);

    // Wyczyść formularz i zamknij modal
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("emailUser").value = "";
    modal.style.display = "none";
    console.log("Aktualna lista użytkowników:", userList);
  } else {
    alert("Wszystkie pola są wymagane.");
  }

  var callAPI = (firstName, lastName, email) => {
    // utwórz obiekt nagłówków
    var myHeaders = new Headers();
    // dodaj nagłówek typu zawartości do obiektu
    myHeaders.append("Content-Type", "application/json");
    // korzystając z wbudowanego pakietu narzędzi JSON, zmień obiekt na ciąg i zapisz w zmiennej
    var raw = JSON.stringify({
      email: email,
      firstName: fname,
      lastName: lname,
    });

    // utwórz obiekt JSON z parametrami dla wywołania API i zapisz w zmiennej
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    // wykonaj wywołanie API z parametrami i użyj obietnic, aby uzyskać odpowiedź
    fetch(
      "https://9bdx1bznr7.execute-api.eu-north-1.amazonaws.com/dev",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => alert(JSON.parse(result).body))
      .catch((error) => console.log("error", error));
  };
};

deleteBtn.onclick = () => {
  const checkboxes = document.querySelectorAll(".rowCheckbox");
  checkboxes.forEach((cb, index) => {
    if (cb.checked) {
      // Usuń z DOM
      cb.closest("tr").remove();
      // Usuń z listy (index odpowiada kolejności renderowania)
      userList[index] = null; // zaznacz do usunięcia
    }
  });

  // Oczyść listę z pustych wartości
  userList = userList.filter((user) => user !== null);

  console.log("Lista po usunięciu:", userList);
};
