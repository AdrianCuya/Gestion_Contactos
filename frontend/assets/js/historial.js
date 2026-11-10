document.addEventListener("DOMContentLoaded", () => {
    let contactosData = [];
    let filtroActual = "todos";

    // Cargar nombre de usuario desde localStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo'));
    const userDisplay = document.getElementById("user-name-display");
    if (userDisplay) {
        userDisplay.textContent = usuarioGuardado.name;
    }

    cargarHistorial();

    async function cargarHistorial() {
        console.log("Iniciando petición a /api/historial...");
        try {
            const response = await fetch("http://localhost:5000/api/historial");
            
            if (!response.ok) {
                throw new Error(`Respuesta del servidor no OK. Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Datos recibidos desde Flask:", data);

            // Actualizar contadores
            if (data.totales) {
                document.getElementById("cant-todos").textContent = data.totales.todos || 0;
                document.getElementById("cant-ocr").textContent = data.totales.ocr || 0;
                document.getElementById("cant-manual").textContent = data.totales.manual || 0;
            }

            contactosData = data.contactos || [];
            renderizarFeed();
        } catch (error) {
            console.error("Error crítico en fetch:", error);
            const feed = document.getElementById("historialFeed");
            if (feed) {
                feed.innerHTML = `
                    <div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md my-4">
                        <p class="font-bold">Error de Conexión:</p>
                        <p class="text-sm">${error.message}</p>
                        <p class="text-xs mt-2">Asegúrate de que 'python app.py' esté corriendo en http://localhost:5000</p>
                    </div>`;
            }
        }
    }

    function renderizarFeed() {
        const feed = document.getElementById("historialFeed");
        if (!feed) return;
        feed.innerHTML = "";

        const filtrados = contactosData.filter(c => {
            if (filtroActual === "todos") return true;
            return c.origen_registro === filtroActual;
        });

        if (filtrados.length === 0) {
            feed.innerHTML = `<p class="text-gray-500 py-6">No hay registros de contactos guardados en MongoDB.</p>`;
            return;
        }

        const grupoHoy = document.createElement("div");
        grupoHoy.className = "space-y-4 mt-6";
        grupoHoy.innerHTML = `<h3 class="text-lg font-bold text-gray-900 border-b pb-2">Hoy</h3>`;

        filtrados.forEach(c => {
            let hora = "Sin hora";
            if (c.fecha_creacion) {
                const fechaObj = new Date(c.fecha_creacion);
                if (!isNaN(fechaObj)) {
                    hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            }

            const nombre = c.nombre_completo || "Contacto sin nombre";
            const empresa = c.empresa_rubro || "Sin empresa/rubro";
            const esOCR = c.origen_registro === 'OCR';

            const itemHTML = `
                <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        ${esOCR ? 'Contacto creado por OCR' : 'Contacto registrado manualmente'}
                    </h4>
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-gray-800">${nombre} - ${empresa}</span>
                        <span class="text-xs text-gray-400 font-mono">${hora}</span>
                    </div>
                    <div>
                        <button onclick="verContacto('${c.id}')" class="bg-[#5d688d] hover:bg-[#4c5677] text-white text-xs px-4 py-1.5 rounded transition-colors cursor-pointer">
                            Ver contacto
                        </button>
                    </div>
                </div>
            `;
            grupoHoy.innerHTML += itemHTML;
        });

        feed.appendChild(grupoHoy);
    }

    // Filtros
    document.querySelectorAll(".btn-filtro").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".btn-filtro").forEach(b => b.classList.remove("bg-slate-200", "active"));
            btn.classList.add("bg-slate-200", "active");
            filtroActual = btn.getAttribute("data-filtro");
            renderizarFeed();
        });
    });
});

function verContacto(id) {
    window.location.href = `pagina_contactos.html?id=${id}`;
}