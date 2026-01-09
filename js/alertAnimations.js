/**
 * Sistema de animaciones para alertas
 * Maneja entrada desde abajo con rebote y salida hacia arriba
 * El fondo (dlgOverlay) permanece fijo mientras solo el contenido se anima
 */

/**
 * Muestra una alerta con animación de entrada
 * @param {jQuery|string} $alertElement - Elemento o selector del alert
 * @param {number} duration - Duración en ms antes de cerrar automáticamente (0 = no cierra)
 */
function showAlert($alertElement, duration = 0) {
    const $element = typeof $alertElement === 'string' ? $($alertElement) : $alertElement;

    if (!$element.length) return;

    // Mostrar el contenedor dlgOverlay
    $element.css('display', 'flex');

    // Obtener el contenido interno (la alerta propiamente)
    const $content = $element.children().first();

    if (!$content.length) return;

    // Limpiar clases previas
    $content.removeClass('alert-exiting');

    // Forzar reflow para asegurar que la animación se aplique
    void $content[0].offsetWidth;

    // Aplicar clase de entrada al contenido
    $content.addClass('alert-entering');

    // Remover la clase de animación al terminar
    const animationEnd = function () {
        $content.removeClass('alert-entering');
        $content.off('animationend', animationEnd);
    };

    $content.on('animationend', animationEnd);

    // Auto-cerrar después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            hideAlert($alertElement);
        }, duration);
    }
}

/**
 * Oculta una alerta con animación de salida
 * @param {jQuery|string} $alertElement - Elemento o selector del alert
 * @param {function} callback - Función a ejecutar cuando termine la animación
 */
function hideAlert($alertElement, callback) {
    const $element = typeof $alertElement === 'string' ? $($alertElement) : $alertElement;

    if (!$element.length) return;

    // Obtener el contenido interno
    const $content = $element.children().first();

    if (!$content.length) {
        // Si no hay contenido, solo ocultar el contenedor
        $element.css('display', 'none');
        if (callback && typeof callback === 'function') callback();
        return;
    }

    // Aplicar clase de salida al contenido
    $content.addClass('alert-exiting');

    const animationEnd = function () {
        $content.removeClass('alert-exiting alert-entering');
        $element.css('display', 'none');
        $content.off('animationend', animationEnd);

        if (callback && typeof callback === 'function') {
            callback();
        }
    };

    $content.on('animationend', animationEnd);
}

/**
 * Alterna visibilidad de una alerta con animación
 * @param {jQuery|string} $alertElement - Elemento o selector del alert
 */
function toggleAlert($alertElement) {
    const $element = typeof $alertElement === 'string' ? $($alertElement) : $alertElement;

    if (!$element.length) return;

    if ($element.css('display') === 'none') {
        showAlert($element);
    } else {
        hideAlert($element);
    }
}
