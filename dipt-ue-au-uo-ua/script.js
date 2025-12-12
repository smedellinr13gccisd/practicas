// 1. Datos de la Práctica (Ampliado para tener dos bloques distintos)
// Las palabras se dividen en dos grupos: BLOQUE 1 y BLOQUE 2.
const allWords = [
    // --- BLOQUE 1 (Palabras iniciales) ---
    // Diptongo UE (category: "ue") - 5 palabras
    { text: "fuego", category: "ue", block: 1 },
    { text: "rueda", category: "ue", block: 1 },
    { text: "cuerpo", category: "ue", block: 1 },
    { text: "nuevo", category: "ue", block: 1 },
    { text: "suelo", category: "ue", block: 1 },
    
    // Diptongo AU (category: "au") - 5 palabras
    { text: "pausa", category: "au", block: 1 },
    { text: "jaula", category: "au", block: 1 },
    { text: "auto", category: "au", block: 1 },
    { text: "causa", category: "au", block: 1 },
    { text: "fraude", category: "au", block: 1 },
    
    // Diptongo UO (category: "uo") - 5 palabras
    { text: "cuota", category: "uo", block: 1 },
    { text: "residuo", category: "uo", block: 1 },
    { text: "mutuo", category: "uo", block: 1 },
    { text: "actúo", category: "uo", block: 1 },
    { text: "arduoso", category: "uo", block: 1 },
    
    // Diptongo UA (category: "ua") - 5 palabras
    { text: "agua", category: "ua", block: 1 },
    { text: "guardar", category: "ua", block: 1 },
    { text: "cuatro", category: "ua", block: 1 },
    { text: "lengua", category: "ua", block: 1 },
    { text: "guapo", category: "ua", block: 1 },
    
    // --- BLOQUE 2 (Palabras para el segundo intento) ---
    // Diptongo UE (category: "ue") - 5 palabras
    { text: "hueso", category: "ue", block: 2 },
    { text: "cueva", category: "ue", block: 2 },
    { text: "trueno", category: "ue", block: 2 },
    { text: "cuerda", category: "ue", block: 2 },
    { text: "abuelo", category: "ue", block: 2 },

    // Diptongo AU (category: "au") - 5 palabras
    { text: "fauna", category: "au", block: 2 },
    { text: "aula", category: "au", block: 2 },
    { text: "laucha", category: "au", block: 2 },
    { text: "audio", category: "au", block: 2 },
    { text: "austero", category: "au", block: 2 },

    // Diptongo UO (category: "uo") - 5 palabras
    { text: "continuo", category: "uo", block: 2 },
    { text: "ambiguo", category: "uo", block: 2 },
    { text: "acuoso", category: "uo", block: 2 },
    { text: "evacuo", category: "uo", block: 2 },
    { text: "individuo", category: "uo", block: 2 },
    
    // Diptongo UA (category: "ua") - 5 palabras
    { text: "suave", category: "ua", block: 2 },
    { text: "iguana", category: "ua", block: 2 },
    { text: "paraguas", category: "ua", block: 2 },
    { text: "recua", category: "ua", block: 2 },
    { text: "estatua", category: "ua", block: 2 },
];

// 2. Referencias del DOM y Variables de Estado
const wordBank = document.getElementById('word-bank');
const dropZones = document.querySelectorAll('.drop-zone');
const feedbackMessage = document.getElementById('feedback-message');
const errorCountDisplay = document.getElementById('error-count');

let selectedWord = null;
let errorCount = 0; // Contador acumulativo
let currentBlock = 1; // Controla qué bloque de palabras estamos cargando
const totalBlocks = 2; // El ejercicio tiene 2 bloques

// El número de palabras que deben estar colocadas para terminar la ronda
const wordsPerBlock = 20; 

// 3. Funciones de Feedback y Conteo de Errores
function updateErrorCount(isCorrect) {
    if (!isCorrect) {
        errorCount++;
        errorCountDisplay.textContent = errorCount;
    }
}

function showFeedback(isCorrect, message) {
    if (feedbackMessage.classList.contains('final-message')) return; 

    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');

    setTimeout(function() {
        feedbackMessage.className = 'feedback';
    }, 1500);
}

function showFinalMessage() {
    // Se muestra el total de errores acumulados
    feedbackMessage.style.backgroundColor = '#673ab7'; 
    feedbackMessage.textContent = `¡Práctica Terminada! Errores totales (Bloque 1 y 2): ${errorCount}. Llévalo a tu maestro para revisión.`;
    feedbackMessage.classList.add('show', 'final-message');
}

// 4. Lógica de Tocar para Seleccionar
function handleWordSelection(event) {
    const targetWord = event.target;
    
    if (targetWord.classList.contains('correct')) {
        return; 
    }

    if (selectedWord) {
        selectedWord.classList.remove('selected');
    }

    if (selectedWord !== targetWord) {
        selectedWord = targetWord;
        selectedWord.classList.add('selected');
    } else {
        selectedWord = null;
    }
}

// 5. Lógica de Tocar para Colocar
function handleZonePlacement(event) {
    if (!selectedWord) {
        showFeedback(false, '¡Selecciona una palabra primero!');
        return;
    }

    const targetZone = event.currentTarget; 
    const wordCategory = selectedWord.dataset.category;
    const zoneCategory = targetZone.dataset.category;
    
    const isCorrect = wordCategory === zoneCategory;

    // 1. Contador de Errores (Acumulativo)
    updateErrorCount(isCorrect); 

    // 2. Mover el elemento y aplicar feedback visual
    targetZone.appendChild(selectedWord);
    selectedWord.classList.remove('selected');
    
    // 3. Aplicar el color (verde/rojo)
    selectedWord.classList.remove('correct', 'incorrect'); 
    selectedWord.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // 4. Mostrar el mensaje
    showFeedback(isCorrect, isCorrect ? '¡Correcto!' : '¡Incorrecto! Intenta otra caja.');

    // 5. Deseleccionar la palabra para el siguiente turno
    selectedWord = null;

    // 6. Verificar si la práctica ha terminado
    checkCompletion();
}


// 6. Control de Flujo (Completar Bloque y Reiniciar)
function checkCompletion() {
    let placedWords = 0;

    dropZones.forEach(zone => {
        // Contamos solo las palabras activas en la ronda actual
        placedWords += zone.querySelectorAll('.selectable-word').length;
    });

    if (placedWords === wordsPerBlock) {
        // El bloque actual ha terminado
        
        if (currentBlock < totalBlocks) {
            // Si es el Bloque 1, preparamos el Bloque 2
            currentBlock++;
            showFeedback(true, '¡Bloque 1 Completado! Cargando nuevas palabras...');
            
            // Pausa y luego limpiar e inicializar el Bloque 2
            setTimeout(loadNextBlock, 2000); 
            
        } else {
            // Es el Bloque 2 (Fin de la práctica)
            showFinalMessage();
            // Deshabilitar más interacción después del mensaje final
            wordBank.style.pointerEvents = 'none';
        }
    }
}

function loadNextBlock() {
    // 1. Limpiar todas las palabras de las cajas para el nuevo bloque
    dropZones.forEach(zone => {
        zone.innerHTML = zone.querySelector('h3').outerHTML; // Solo mantiene el título <h3>
    });
    
    // 2. Limpiar el banco de palabras
    wordBank.innerHTML = '';
    
    // 3. Cargar el siguiente bloque de palabras
    initializeWordElements();
}

// Función auxiliar para mover una palabra al banco y limpiar su estado (usada al reubicar)
function returnToBank(element) {
    element.classList.remove('correct', 'incorrect', 'selected');
    wordBank.appendChild(element); 
    feedbackMessage.classList.remove('show', 'final-message');
    feedbackMessage.style.backgroundColor = '';
    wordBank.style.pointerEvents = 'auto'; // Habilitar si se había desactivado
}

// 7. Inicialización de Palabras (Separado para el reinicio de bloques)
function initializeWordElements() {
    
    // Filtrar las palabras solo para el bloque actual
    const blockWords = allWords.filter(word => word.block === currentBlock);
    
    // 1. Barajar
    blockWords.sort(() => Math.random() - 0.5);
    
    // 2. Crear los elementos HTML
    blockWords.forEach(function(word) {
        const wordDiv = document.createElement('div');
        wordDiv.textContent = word.text; 
        wordDiv.className = 'selectable-word'; 
        wordDiv.dataset.category = word.category;
        wordBank.appendChild(wordDiv); 
    });
}


// 8. Inicialización de la Aplicación (Setup Inicial)
function initializeApp() {
    // Configuración inicial del Bloque 1
    currentBlock = 1; 
    errorCount = 0;
    errorCountDisplay.textContent = '0';
    wordBank.innerHTML = '';
    
    // Cargar las palabras del primer bloque
    initializeWordElements();

    // Configurar Eventos (Solo se configuran una vez en la carga inicial)
    if (!wordBank.hasAttribute('data-listeners-added')) {
         
        wordBank.addEventListener('click', function(e) {
            if (e.target.classList.contains('selectable-word')) {
                handleWordSelection(e);
            }
        });

        dropZones.forEach(function(zone) {
            zone.addEventListener('click', handleZonePlacement);
        });

        dropZones.forEach(function(zone) {
            zone.addEventListener('click', function(e) {
                // Lógica de reubicación: Si tocas una palabra ya colocada (y no hay otra seleccionada)
                if (e.target.classList.contains('selectable-word')) {
                    if (!selectedWord) {
                         returnToBank(e.target);
                         handleWordSelection(e);
                    }
                }
            });
        });

        wordBank.setAttribute('data-listeners-added', 'true');
    }
}

// Inicia la aplicación al cargar
initializeApp();
