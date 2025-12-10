// 1. Datos de la Práctica 
const allWords = [
    // SUSTANTIVOS PROPIOS (category: "propio")
    { text: "Maria", category: "propio" },
    { text: "Carlos", category: "propio" },
    { text: "Walmart", category: "propio" },
    { text: "Mexico", category: "propio" },
    { text: "Texas", category: "propio" },
    { text: "Ale", category: "propio" },
    
    // SUSTANTIVOS COMUNES (category: "comun")
    { text: "casa", category: "comun" },
    { text: "fruta", category: "comun" },
    { text: "silla", category: "comun" },
    { text: "libro", category: "comun" },
    { text: "gato", category: "comun" },
    { text: "niño", category: "comun" },
    
    // NO SUSTANTIVOS (category: "no-sustantivo")
    { text: "rie", category: "no-sustantivo" },
    { text: "sube", category: "no-sustantivo" },
    { text: "camina", category: "no-sustantivo" },
    { text: "ladra", category: "no-sustantivo" },
    { text: "escribe", category: "no-sustantivo" },
    { text: "lee", category: "no-sustantivo" },
];

// 2. Referencias del DOM usando jQuery
const wordBank = $('#word-bank');
const dropZones = $('.drop-zone');
const feedbackMessage = $('#feedback-message');

// Muestra el popup de feedback (correcto/incorrecto)
function showFeedback(isCorrect, message) {
    feedbackMessage.text(message);
    feedbackMessage.removeClass().addClass('feedback show ' + (isCorrect ? 'correct' : 'incorrect'));

    // Desaparece el mensaje después de 1.5 segundos
    setTimeout(function() {
        feedbackMessage.removeClass().addClass('feedback');
    }, 1500);
}

// Lógica de Soltar y Verificar 
function handleDrop(element, zone) {
    const isCorrect = element.data('category') === $(zone).data('category');
    
    if (isCorrect) {
        // Correcto: Mueve la palabra a la zona
        $(zone).append(element);
        element.addClass('placed').draggable('disable'); // Desactiva el arrastre
        showFeedback(true, '¡Correcto!');
    } else {
        // Incorrecto: Muestra error. La palabra vuelve sola por la opción 'revert: true'
        showFeedback(false, '¡Error! Inténtalo de nuevo.');
    }
}


// Inicializa las palabras y les da funcionalidad de arrastre
function initializeWords() {
    allWords.forEach(function(word) {
        // Creamos la palabra
        const wordDiv = $('<div>')
            .text(word.text)
            .addClass('draggable-word')
            .data('category', word.category);
            
        // La hacemos DRAGGABLE (Arrastrable)
        wordDiv.draggable({
            revert: true, // Vuelve al inicio si no es soltada correctamente
            cursor: 'grabbing',
            zIndex: 1000
        });

        wordBank.append(wordDiv);
    });

    // Hacemos que las zonas de soltar sean DROPPABLE
    dropZones.droppable({
        accept: '.draggable-word', 
        drop: function(event, ui) {
            handleDrop(ui.draggable, this); // ui.draggable es la palabra arrastrada
        }
    });
}

// Inicializa la aplicación cuando el documento está listo
$(function() {
    initializeWords();
});
