document.getElementById('formLogin').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar la sesión del usuario en localStorage
            localStorage.setItem('usuarioActivo', JSON.stringify(data.user));

            // Redirigir a la página principal
            window.location.href = "pagina_principal.html";
        } else {
            alert("Error: " + (data.message || "Credenciales incorrectas"));
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("No se pudo conectar con el servidor.");
    }
});