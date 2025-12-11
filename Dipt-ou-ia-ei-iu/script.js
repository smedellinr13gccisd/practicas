// 1. Datos de la Práctica (Listas Corregidas)
const allWords = [
    // Diptongo OU (category: "ou") - Palabras que contienen claramente el grupo OU
    { text: "rouca", category: "ou" },
    { text: "souza", category: "ou" },
    { text: "gourmet", category: "ou" },
    { text: "boutique", category: "ou" }, // Nombre propio o préstamo común
    { text: "coupon", category: "ou" },   // Préstamo común
    { text: "Houston", category: "ou" },  // Nombre propio geográfico muy común
    
    // Diptongo IA (category: "ia") - Se mantienen correctas
    { text: "viaje", category: "ia" },
    { text: "piano", category: "ia" },
    { text: "diario", category: "ia" },
    { text: "rabia", category: "ia" },
    { text: "cambia", category: "ia" },
    { text: "savia", category: "ia" },
    
    // Diptongo EI (category: "ei") - Se mantienen correctas
    { text: "peine", category: "ei" },
    { text: "seis", category: "ei" },
    { text: "treinta", category: "ei" },
    { text: "aceite", category: "ei" },
    { text: "reina", category: "ei" },
    { text: "deis", category: "ei" },
    
    // Diptongo IU (category: "iu") - Corregidas, usando ejemplos comunes
    { text: "ciudad", category: "iu" },
    { text: "triunfo", category: "iu" },
    { text: "viuda", category: "iu" },
    { text: "viudedad", category: "iu" },
    { text: "diurno", category: "iu" },
    { text: "piular", category: "iu" }, // Ejemplo de sonido o verbo
];

// 2. Referencias del DOM
const wordBank = document.getElementById('word-bank');
const dropZones = document.querySelectorAll('.drop-zone');
const feedbackMessage = document.getElementById('feedback-message');

let selectedWord = null; // Palabra actualmente seleccionada/activa

// 3. Funciones de Feedback Visual
function showFeedback(isCorrect, message) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');

    setTimeout(function() {
        feedbackMessage.className = 'feedback';
    }, 1500);
}

// 4. Lógica de Tocar para Seleccionar (Banco de Palabras)
function handleWordSelection(event) {
    const targetWord = event.target;
    
    if (targetWord.classList.contains('correct')) {
        return; 
    }

    // 1. Deseleccionar la palabra que estaba activa (si existe)
    if (selectedWord) {
        selectedWord.classList.remove('selected');
    }

    // 2. Seleccionar la nueva palabra
    if (selectedWord !== targetWord) {
        selectedWord = targetWord;
        selectedWord.classList.add('selected');
    } else {
        // Si toca la misma palabra dos veces, la deseleccionamos
        selectedWord = null;
    }
}

// 5. Lógica de Tocar para Colocar (Zonas de Soltar)
function handleZonePlacement(event) {
    if (!selectedWord) {
        showFeedback(false, '¡Selecciona una palabra primero!');
        return;
    }

    const targetZone = event.currentTarget; 
    const wordCategory = selectedWord.dataset.category;
    const zoneCategory = targetZone.dataset.category;
    
    const isCorrect = wordCategory === zoneCategory;

    // 1. Mover el elemento y aplicar feedback visual
    targetZone.appendChild(selectedWord);
    selectedWord.classList.remove('selected');
    
    // 2. Aplicar el color (verde/rojo)
    selectedWord.classList.remove('correct', 'incorrect'); 
    selectedWord.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // 3. Mostrar el mensaje
    showFeedback(isCorrect, isCorrect ? '¡Correcto!' : '¡Incorrecto! Intenta otra caja.');

    // 4. Deseleccionar la palabra para el siguiente turno
    selectedWord = null;
}


// Función auxiliar para mover una palabra al banco y limpiar su estado
function returnToBank(element) {
    // Limpia los estados de color y selección
    element.classList.remove('correct', 'incorrect', 'selected');
    // Mueve al banco
    wordBank.appendChild(element); 
}


// 6. Inicialización de la Aplicación
function initializeApp() {
    // Se crea una copia y se revuelve para que el orden sea aleatorio
    const shuffledWords = allWords.sort(() => Math.random() - 0.5); 
    
    shuffledWords.forEach(function(word) {
        const wordDiv = document.createElement('div');
        wordDiv.textContent = word.text; 
        wordDiv.className = 'selectable-word'; 
        wordDiv.dataset.category = word.category;
        wordBank.appendChild(wordDiv); 
    });

    // B. Añade los listeners de eventos

    // Listener para SELECCIONAR (en el banco de palabras)
    wordBank.addEventListener('click', function(e) {
        if (e.target.classList.contains('selectable-word')) {
            handleWordSelection(e);
        }
    });

    // Listener para COLOCAR (en las zonas de soltar)
    dropZones.forEach(function(zone) {
        zone.addEventListener('click', handleZonePlacement);
    });

    // Listener para REUBICAR (Si el estudiante toca una palabra colocada)
    dropZones.forEach(function(zone) {
        zone.addEventListener('click', function(e) {
            // Si el clic fue en una palabra ya colocada...
            if (e.target.classList.contains('selectable-word')) {
                // Primero, movemos la palabra de vuelta al banco
                returnToBank(e.target);
                // Luego la seleccionamos para que pueda ser colocada de nuevo
                handleWordSelection(e);
            }
        });
    });
}

// Inicia la aplicación al cargar
initializeApp();
