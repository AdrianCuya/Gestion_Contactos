document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRegistroManual');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelar = document.getElementById('btnCancelar');

    // Estado inicial: Modo edición de datos
    let modoVistaPrevia = false;

    form?.addEventListener('submit', async function(e) {
        e.preventDefault();

       
        if (!modoVistaPrevia) {
            hacerSoloLectura(true);
            btnGuardar.textContent = "Confirmar y Guardar";
            btnCancelar.textContent = "Editar datos";
            btnCancelar.removeAttribute("href");
            btnCancelar.onclick = (e) => {
                e.preventDefault();
                hacerSoloLectura(false);
            };
            modoVistaPrevia = true;
            return;
        }

        // Envío definitivo a MongoDB Atlas
        const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || '{}');

        const contactoData = {
            usuario_email: usuarioActivo.email || 'desconocido',
            origen: 'Manual',
            tipoContacto: document.getElementById('tipoContacto').value,
            nombre: document.getElementById('nombre').value,
            empresa: document.getElementById('empresa').value,
            telefono: document.getElementById('telefono').value,
            correo: document.getElementById('correo').value,
            etiqueta: document.getElementById('etiqueta').value,
            nota: document.getElementById('nota').value,
            frecuencia: document.getElementById('frecuencia').value,
            codigoPedido: document.getElementById('codigoPedido').value,
            detallePedido: document.getElementById('detallePedido').value,
            recordatorio: document.getElementById('recordatorio').value
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactoData)
            });

            const resData = await response.json();

            if (response.ok) {
                alert("¡Contacto guardado correctamente en la base de datos!");
                window.location.href = "pagina_contactos.html";
            } else {
                alert("Error al guardar: " + (resData.message || "Ocurrió un problema"));
            }
        } catch (error) {
            console.error("Error al guardar el contacto:", error);
            alert("No se pudo conectar con el servidor backend.");
        }
    });

    // Función para bloquear o desbloquear los campos
    function hacerSoloLectura(estado) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (estado) {
                input.setAttribute('readonly', 'true');
                if (input.tagName === 'SELECT') input.style.pointerEvents = 'none';
            } else {
                input.removeAttribute('readonly');
                if (input.tagName === 'SELECT') input.style.pointerEvents = 'auto';
            }
        });

        if (!estado) {
            btnGuardar.textContent = "Guardar";
            btnCancelar.textContent = "Cancelar";
            btnCancelar.setAttribute("href", "eleccion_ingreso.html");
            btnCancelar.onclick = null;
            modoVistaPrevia = false;
        }
    }
});