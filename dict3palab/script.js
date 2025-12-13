document.addEventListener('DOMContentLoaded', () => {
    // Array de oraciones sencillas (Artículo, Sustantivo, Verbo)
    const sentences = [
        ["La", "rana", "nada."],
        ["El", "perro", "corre."],
        ["Una", "flor", "crece."],
        ["Un", "gato", "salta."],
        ["El", "sol", "brilla."],
        ["La", "niña", "come."],
        ["Mi", "papá", "lee."],
        ["Tu", "casa", "es."], 
        ["El", "pez", "nada."],
        ["Un", "árbol", "cae."]
    ];
    
    let currentSentence = [];
    let completedCount = 0;
    let preferredVoice = null; // Para almacenar la voz de español de México
    
    const inputArea = document.getElementById('input-area');
    const playButton = document.getElementById('play-sentence-btn');
    const nextButton = document.getElementById('next-sentence-btn');
    const countDisplay = document.getElementById('completed-count');

    // --- Configuración de Voz para Safari/iOS ---

    /**
     * Carga y establece la voz preferida (español de México) de forma asíncrona.
     */
    function setPreferredVoice() {
        const voices = speechSynthesis.getVoices();
        
        // 1. Intentar encontrar voz de México (es-MX)
        preferredVoice = voices.find(voice => voice.lang === 'es-MX');

        // 2. Si no se encuentra, buscar voz genérica en español
        if (!preferredVoice) {
            preferredVoice = voices.find(voice => voice.lang.startsWith('es-'));
        }
    }
    
    // El evento 'voiceschanged' es crucial en Safari para asegurar que las voces se carguen.
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setPreferredVoice;
    }
    // Llamar una vez por si ya están cargadas
    setPreferredVoice();


    /**
     * Función para obtener una oración aleatoria y única.
     */
    function getRandomSentence() {
        if (sentences.length === 0) {
            alert("¡Has completado todas las oraciones! Reiniciando la práctica.");
            // Opcional: recargar el array de oraciones aquí si el profesor quiere que continúe.
            // Por ahora, terminamos la práctica
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[randomIndex];
        sentences.splice(randomIndex, 1); 
        return sentence;
    }

    /**
     * Inicializa una nueva oración en la práctica.
     */
    function initializePractice() {
        currentSentence = getRandomSentence();
        if (!currentSentence) {
            playButton.disabled = true;
            return;
        }

        inputArea.innerHTML = '';
        nextButton.classList.add('hidden');
        playButton.disabled = false; // Asegurar que se puede reproducir la nueva oración

        currentSentence.forEach((word, index) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'word-input';
            input.maxLength = 15;
            input.placeholder = `Palabra ${index + 1}`;
            input.setAttribute('data-index', index);
            input.addEventListener('input', checkWord);
            inputArea.appendChild(input);
        });
    }

    /**
     * Usa la Web Speech API para leer la oración en voz alta.
     */
    function speakSentence() {
        if (currentSentence.length === 0) return;

        const textToSpeak = currentSentence.join(' ');
        
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.lang = 'es-MX';
        utterance.rate = 0.8; 
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        } else {
            // Fallback si la voz aún no se ha cargado o no existe la de MX
            utterance.lang = 'es';
        }

        speechSynthesis.speak(utterance);
    }

    /**
     * Comprueba la palabra escrita por el estudiante aplicando reglas ortográficas.
     */
    function checkWord(event) {
        const input = event.target;
        const index = parseInt(input.getAttribute('data-index'));
        const correctWord = currentSentence[index];
        const studentInput = input.value.trim();
        
        let isCorrect = false;

        // Limpiar la palabra correcta de puntuación para comparación de letras/capitalización
        let baseCorrect = correctWord.replace('.', '');
        
        if (index === 0) {
            // Regla: Primera palabra SIEMPRE requiere mayúscula inicial (coincidencia exacta)
            isCorrect = (studentInput === baseCorrect);
            
        } else if (index === currentSentence.length - 1) {
            // Regla 1: Debe ser minúscula (salvo sustantivo propio, que no se usa aquí)
            // Regla 2: Debe llevar punto final obligatorio
            
            // Comparamos el valor del estudiante con la palabra correcta (incluyendo el punto final)
            isCorrect = (studentInput === correctWord);
            
            // Opcional: Permitir la palabra correcta sin punto, pero no la marcaremos como "correcta final"
            // Para obligar el punto, la comparación es literal: studentInput === correctWord.
            
        } else {
            // Regla: Palabras intermedias deben ir en minúscula.
            // Forzamos la comparación en minúsculas para aceptar 'rana' o 'RaNa' como correcto,
            // pero el usuario solo debe escribir 'rana'.
            
            // Para el dictado, la regla es estricta: deben escribir la palabra tal cual,
            // pero sin mayúscula forzada para sustantivos comunes.
            
            // Opción 1 (Estricta): La palabra intermedia debe ser igual a la baseCorrect y en minúsculas.
            // baseCorrect.toLowerCase() asegura que, p.ej., 'Rana' se convierte a 'rana'.
            isCorrect = (studentInput.toLowerCase() === baseCorrect.toLowerCase() && studentInput === baseCorrect.toLowerCase());
            
            // Damos un pequeño margen permitiendo que si lo escribe en mayúscula, se considere bien
            // si la palabra base es un sustantivo común (como 'rana').
            // Pero para reforzar la ortografía, seremos estrictos con las minúsculas.
            isCorrect = (studentInput === baseCorrect.toLowerCase());
        }

        // Aplicar estilos de retroalimentación
        input.classList.remove('correct', 'incorrect');
        if (studentInput.length > 0) {
            if (isCorrect) {
                input.classList.add('correct');
                input.disabled = true; // Deshabilitar si es correcta
            } else {
                input.classList.add('incorrect');
            }
        }
        
        checkCompletion();
    }

    /**
     * Comprueba si todas las cajas de texto son correctas.
     */
    function checkCompletion() {
        const inputs = Array.from(inputArea.querySelectorAll('.word-input'));
        const allCorrect = inputs.every(input => input.classList.contains('correct'));

        if (allCorrect && inputs.length === currentSentence.length) {
            if (nextButton.classList.contains('hidden')) {
                completedCount++;
                countDisplay.textContent = completedCount;
                nextButton.classList.remove('hidden');
                playButton.disabled = true; 
            }
        } else {
            if (!nextButton.classList.contains('hidden')) {
                nextButton.classList.add('hidden');
                playButton.disabled = false;
            }
        }
    }

    // --- Event Listeners ---

    playButton.addEventListener('click', speakSentence);
    
    nextButton.addEventListener('click', () => {
        initializePractice();
    });

    // Iniciar la primera práctica al cargar
    initializePractice();
});
