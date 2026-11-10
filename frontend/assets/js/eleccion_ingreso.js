document.addEventListener('DOMContentLoaded', () => {
    const btnOcr = document.getElementById('btn-ocr');
    const btnManual = document.getElementById('btn-manual');

    // Redirección al seleccionar la opción OCR
    btnOcr?.addEventListener('click', () => {
        // Redirige a la pantalla de cámara/escanear (crear vista cuando se implemente)
        window.location.href = "registro_ocr.html";
    });

    // Redirección al seleccionar la opción Manual
    btnManual?.addEventListener('click', () => {
        // Redirige a la pantalla de formulario manual
        window.location.href = "registro_manual.html";
    });
});