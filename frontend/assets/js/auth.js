const API_URL = "http://127.0.0.1:5000/api";

// -------------------------------------------------------------
// 1. REGISTRO EN MONGO DB
// -------------------------------------------------------------
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("regName") ? document.getElementById("regName").value : "Usuario";
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Cuenta guardada en MongoDB correctamente!");
                window.location.href = "login.html";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al conectar con la base de datos:", error);
            alert("No se pudo conectar con el servidor backend.");
        }
    });
}

// -------------------------------------------------------------
// 2. INICIO DE SESIÓN DESDE MONGO DB
// -------------------------------------------------------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar temporalmente los datos de sesión activa en la app
                sessionStorage.setItem("currentUser", JSON.stringify(data.user));
                alert(`Bienvenido ${data.user.name}`);
                window.location.href = "pagina_principal.html";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al autenticar:", error);
            alert("Error al conectar con el servidor.");
        }
    });
}