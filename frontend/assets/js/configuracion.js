
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Validar que exista una sesión activa en el almacenamiento local
    const usuarioGuardado = localStorage.getItem('usuarioActivo');
    if (!usuarioGuardado) {
        
        window.location.href = "login.html";
        return;
    }

    // Convertir los datos guardados de JSON a un objeto JavaScript
    const usuario = JSON.parse(usuarioGuardado);

    // 2. Renderizar la información del usuario en la interfaz
    const elNombre = document.getElementById('nombreUsuarioSidebar');
    const cfgNombre = document.getElementById('cfgNombreUsuario');
    const cfgEmail = document.getElementById('cfgEmailUsuario');

    if (elNombre) elNombre.textContent = usuario.name || usuario.email;
    if (cfgNombre) cfgNombre.textContent = usuario.name || 'Sin nombre';
    if (cfgEmail) cfgEmail.textContent = usuario.email || 'Sin correo';

    // 3. Lógica para el botón de Cerrar Sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    btnCerrarSesion?.addEventListener('click', () => {
        const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
        if (confirmar) {
            // Eliminar los datos del usuario activo del localStorage
            localStorage.removeItem('usuarioActivo');
            // Redirigir a la pantalla de login
            window.location.href = "login.html";
        }
    });

});