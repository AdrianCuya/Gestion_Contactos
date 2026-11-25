document.addEventListener('DOMContentLoaded', () => {
    const btnOpenModal = document.getElementById('btn-open-modal');
    const modalEleccion = document.getElementById('modalEleccion');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const btnCancelarModal = document.getElementById('btnCancelarModal');

    // Abrir modal
    if (btnOpenModal && modalEleccion) {
        btnOpenModal.addEventListener('click', (e) => {
            e.preventDefault();
            modalEleccion.classList.add('active');
        });
    } else {
        console.error("No se encontró el botón #btn-open-modal o el modal #modalEleccion en el DOM.");
    }

    // Cerrar modal con 'X' o 'Cancelar'
    [btnCerrarModal, btnCancelarModal].forEach(btn => {
        btn?.addEventListener('click', (e) => {
            e.preventDefault();
            modalEleccion?.classList.remove('active');
        });
    });

    // Redirección al seleccionar Ingreso Manual
    document.getElementById('btn-manual')?.addEventListener('click', () => {
        window.location.href = "registro_manual.html";
    });

    // Redirección al seleccionar OCR
    document.getElementById('btn-ocr')?.addEventListener('click', () => {
        window.location.href = "escanear_ocr.html";
    });
});

// CARGAR NOMBRE DE USUARIO EN EL SIDEBAR
// Lee los datos de la sesión actual almacenados en el navegador (localStorage)
// y busca el elemento HTML con el ID 'nombreUsuarioSidebar' para mostrar su nombre.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar nombre de usuario desde localStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo'));
    const nombreDisplay = document.getElementById('nombreUsuarioSidebar');
    if (nombreDisplay) {
        nombreDisplay.textContent = usuarioGuardado.name;
    }

    // Cargar contactos desde la API de Flask
    cargarContactos();

    // Listener del buscador dinámico
    const inputBuscar = document.getElementById('inputBuscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            const termino = e.target.value.trim().toLowerCase();
            filtrarTabla(termino);
        });
    }
});

// Almacén global temporal para los contactos de MongoDB
let contactosCargados = [];


async function cargarContactos() {
    const tbody = document.getElementById('tablaContactosBody');
    if (!tbody) return;

    try {
        const response = await fetch('http://localhost:5000/api/contacts');
        if (!response.ok) throw new Error('Error al obtener datos del servidor');

        contactosCargados = await response.json();
        renderizarTabla(contactosCargados);
    } catch (error) {
        console.error('[ERROR AL CARGAR CONTACTOS]:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="p-4 text-center text-red-500 font-medium">
                    No se pudo conectar con la base de datos.
                </td>
            </tr>`;
    }
}


 // Filtra y renderiza en tiempo real según lo escrito en el input
 
function filtrarTabla(termino) {
    // Si el buscador está vacío, muestra todos los contactos
    if (termino === '') {
        renderizarTabla(contactosCargados);
        return;
    }

    // Filtrar ignorando mayúsculas/minúsculas en Nombre, Empresa o Correo
    const resultados = contactosCargados.filter(contacto => {
        const nombre = (contacto.nombre || contacto.nombre_completo || '').toLowerCase();
        const empresa = (contacto.empresa || contacto.empresa_rubro || '').toLowerCase();
        const correo = (contacto.correo || contacto.email || '').toLowerCase();
        const telefono = (contacto.telefono || '').toLowerCase();
        const nota = (contacto.nota || '').toLowerCase();
        const recordatorio = (contacto.recordatorio || '').toLowerCase();

        return nombre.includes(termino) || 
               empresa.includes(termino) || 
               correo.includes(termino) ||
               telefono.includes(termino)||
               nota.includes(termino) ||
               recordatorio.includes(termino);
    });

    renderizarTabla(resultados, termino);
}

//Pinta las filas de la tabla en el HTML
 
function renderizarTabla(contactos, terminoBusqueda = '') {
    const tbody = document.getElementById('tablaContactosBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (contactos.length === 0) {
        const mensaje = terminoBusqueda 
            ? `No se encontraron contactos que coincidan con "${terminoBusqueda}".`
            : 'No hay contactos registrados aún.';

        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="p-6 text-center text-gray-500 italic">
                    ${mensaje}
                </td>
            </tr>`;
        return;
    }

    contactos.forEach(contacto => {
        const id = contacto._id;
        const nombre = contacto.nombre || contacto.nombre_completo || 'Sin nombre';
        const telefono = contacto.telefono || '-';
        const correo = contacto.correo || contacto.email || '-';
        const empresa = contacto.empresa || contacto.empresa_rubro || '-';
        const frecuencia = contacto.frecuencia || contacto.frecuencia_compra || '-';
        const origen = contacto.origen_registro || contacto.origen || 'MANUAL';
        const codigo = contacto.codigoPedido || contacto.codigo_pedido || '-';
        const nota = contacto.nota || '-';
        const recordatorio = contacto.recordatorio || '-';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-100 transition-colors border-b border-gray-200';
        tr.innerHTML = `
            <td class="p-2 md:p-3 font-medium text-gray-900">${nombre}</td>
            <td class="p-2 md:p-3">${telefono}</td>
            <td class="p-2 md:p-3">${correo}</td>
            <td class="p-2 md:p-3">${empresa}</td>
            <td class="p-2 md:p-3">${frecuencia}</td>
            <td class="p-2 md:p-3">
                <span class="px-2 py-1 text-[11px] font-semibold rounded-full ${origen === 'OCR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                    ${origen}
                </span>
            </td>
            <td class="p-2 md:p-3">${codigo}</td>
            <td class="p-2 md:p-3 max-w-xs truncate">${nota}</td>
            <td class="p-2 md:p-3 max-w-xs truncate">${recordatorio}</td>
            <td class="p-2 md:p-3 text-center">
                <button onclick="eliminarContacto('${id}')" class="text-red-600 hover:text-red-800 p-1 rounded-md transition-colors" title="Eliminar contacto">
                    <i class='bx bx-trash text-lg'></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


//Petición DELETE a Flask para borrar un contacto
 
async function eliminarContacto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este contacto?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/contacts/${id}`, {
           method: 'DELETE'
  });
        if (response.ok) {
            mostrarToast('Contacto eliminado correctamente');
            cargarContactos();
        } else {
            const errData = await response.json();
            alert(`Error: ${errData.message}`);
        }
    } catch (error) {
        console.error('[ERROR AL ELIMINAR]:', error);
        alert('No se pudo conectar con el servidor.');
    }
}


function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    if (toast && toastText) {
        toastText.textContent = mensaje;
        toast.classList.remove('translate-y-20', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
}