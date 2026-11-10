document.addEventListener("DOMContentLoaded", () => {

     // Cargar nombre de usuario desde localStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo'));
    const userDisplay = document.getElementById("user-name-display");
    if (userDisplay) {
        userDisplay.textContent = usuarioGuardado.name;
    }
    const chatContainer = document.getElementById("chatContainer");
    const inputMensaje = document.getElementById("inputMensaje");
    const btnEnviar = document.getElementById("btnEnviar");

    if (btnEnviar) btnEnviar.addEventListener("click", enviarMensaje);
    if (inputMensaje) {
        inputMensaje.addEventListener("keypress", (e) => {
            if (e.key === "Enter") enviarMensaje();
        });
    }

    async function enviarMensaje() {
        const mensajeTexto = inputMensaje.value.trim();
        if (!mensajeTexto) return;

        agregarMensajeAlChat(mensajeTexto, "usuario");
        inputMensaje.value = "";

        const loaderId = agregarIndicadorCarga();

        try {
            const response = await fetch("http://localhost:5000/api/chat-ia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: mensajeTexto })
            });

            removerIndicadorCarga(loaderId);

            const data = await response.json();

            if (!response.ok) {
                // Muestra el mensaje exacto enviado por Flask
                agregarMensajeAlChat(`Error (${response.status}): ${data.message}`, "error");
                return;
            }

            agregarMensajeAlChat(data.reply, "ia");

        } catch (error) {
            removerIndicadorCarga(loaderId);
            console.error("Detalle del error:", error);
            agregarMensajeAlChat(`Error de red/conexión: ${error.message}`, "error");
        }
    }

    function agregarMensajeAlChat(texto, tipo) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `flex ${tipo === 'usuario' ? 'justify-end' : 'justify-start'} mb-4`;

        let colorBg = "bg-gray-100 text-gray-800";
        if (tipo === 'usuario') colorBg = "bg-slate-700 text-white";
        if (tipo === 'error') colorBg = "bg-red-100 text-red-700 border border-red-300";

        msgDiv.innerHTML = `
            <div class="max-w-[75%] p-3.5 rounded-2xl text-sm ${colorBg} shadow-sm">
                ${texto}
            </div>
        `;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function agregarIndicadorCarga() {
        const id = "loader-" + Date.now();
        const loaderDiv = document.createElement("div");
        loaderDiv.id = id;
        loaderDiv.className = "flex justify-start mb-4";
        loaderDiv.innerHTML = `
            <div class="bg-gray-100 text-gray-500 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                <i class='bx bx-loader-alt animate-spin text-base'></i> Llama está pensando...
            </div>
        `;
        chatContainer.appendChild(loaderDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return id;
    }

    function removerIndicadorCarga(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
});