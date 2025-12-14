document.addEventListener('DOMContentLoaded', () => {
    // Lista completa de sílabas comunes (se mantiene)
    const allSyllables = [
        "ma", "me", "mi", "mo", "mu", "pa", "pe", "pi", "po", "pu", 
        "sa", "se", "si", "so", "su", "la", "le", "li", "lo", "lu", 
        "da", "de", "di", "do", "du", "ra", "re", "ri", "ro", "ru", 
        "na", "ne", "ni", "no", "nu", "ta", "te", "ti", "to", "tu",
        "ca", "co", "cu", "que", "qui", "ga", "go", "gu", 
        "cha", "che", "chi", "cho", "chu", "lla", "lle", "lli", "llo", "llu", 
        "ba", "be", "bi", "bo", "bu", "fa", "fe", "fi", "fo", "fu",
        "ja", "je", "ji", "jo", "ju", "va", "ve", "vi", "vo", "vu",
        "za", "ze", "zi", "zo", "zu",
    ];
    
    const NUM_OPTIONS = 5;
    let currentCorrectSyllable = '';
    let completedCount = 0;
    let preferredVoice = null; 
    let isWaitingForListen = true; // NUEVO: Bandera para controlar el estado

    const optionsArea = document.getElementById('syllable-options');
    const playButton = document.getElementById('play-syllable-btn');
    const nextButton = document.getElementById('next-syllable-btn');
    const countDisplay = document.getElementById('completed-count');
    const errorModal = document.getElementById('error-modal');
    const closeModalButton = document.getElementById('close-modal-btn');
    const instructionText = document.querySelector('.instruction'); // Seleccionamos el texto de instrucción

    // --- Configuración de Voz (Optimizado para tono infantil en iOS) ---
    function setPreferredVoice() {
        const voices = speechSynthesis.getVoices();
        const targetVoiceNames = [
            /sandra/i, /sofía/i, /ximena/i, /carmen/i, /teresa/i, /paulina/i, /niña/i, /mujer/i, /female/i
        ];
        const spanishVoices = voices.filter(voice => voice.lang.startsWith('es'));
        
        let clearVoice = spanishVoices.find(voice => targetVoiceNames.some(regex => regex.test(voice.name)));
        if (!clearVoice) {
            clearVoice = spanishVoices.find(voice => voice.lang === 'es-MX');
        }
        preferredVoice = clearVoice || spanishVoices[0] || null;
    }
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setPreferredVoice;
    }
    setPreferredVoice();


    /**
     * Usa la Web Speech API para leer la sílaba en voz alta.
     */
    function speakSyllable(syllable) {
        if (!syllable) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(syllable);
        
        // Parámetros CRÍTICOS para voz infantil en iOS
        utterance.rate = 0.9;  
        utterance.pitch = 1.2; 
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
            utterance.lang = preferredVoice.lang; 
        } else {
            utterance.lang = 'es-MX';
        }

        speechSynthesis.speak(utterance);
        
        // Después de que la voz empieza a hablar, habilitamos las opciones
        utterance.onend = () => {
             enableSyllableBoxes();
             isWaitingForListen = false;
             instructionText.textContent = "¡Selecciona la sílaba correcta!";
        };
        
        // En caso de que iOS bloquee el 'onend' (por si acaso), lo forzamos al inicio del speech
        utterance.onstart = () => {
             enableSyllableBoxes();
             isWaitingForListen = false;
             instructionText.textContent = "¡Selecciona la sílaba correcta!";
        };
    }

    /**
     * Helper para deshabilitar las cajas.
     */
    function disableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            box.classList.add('disabled');
            box.removeEventListener('click', handleSelection);
        });
    }

    /**
     * Helper para habilitar las cajas.
     */
    function enableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            box.classList.remove('disabled');
            box.addEventListener('click', handleSelection);
        });
    }
    
    /**
     * Obtiene opciones (se mantiene).
     */
    function generateOptions() {
        const shuffledSyllables = [...allSyllables].sort(() => 0.5 - Math.random());
        currentCorrectSyllable = shuffledSyllables[0];
        let incorrectOptions = shuffledSyllables.slice(1, NUM_OPTIONS);
        let options = [currentCorrectSyllable, ...incorrectOptions];
        options.sort(() => 0.5 - Math.random());
        return options;
    }

    /**
     * Inicializa una nueva práctica de sílaba.
     */
    function initializePractice() {
        const options = generateOptions();
        
        optionsArea.innerHTML = ''; 
        nextButton.classList.add('hidden');
        isWaitingForListen = true; // Resetear la bandera
        instructionText.textContent = "Pulsa la bocina para escuchar la sílaba.";

        options.forEach(syllable => {
            const box = document.createElement('div');
            box.className = 'syllable-box';
            box.textContent = syllable.toUpperCase(); 
            box.setAttribute('data-syllable', syllable);
            // IMPORTANTE: NO añadir el listener 'click' aquí
            optionsArea.appendChild(box);
        });
        
        // Deshabilitar la interacción hasta que el usuario pulse la bocina
        disableSyllableBoxes(); 
    }
    
    /**
     * Maneja la selección de una caja de sílaba por el estudiante.
     */
    function handleSelection(event) {
        // Ignorar si aún no han pulsado la bocina
        if (isWaitingForListen) return;
        
        const selectedBox = event.target;
        const selectedSyllable = selectedBox.getAttribute('data-syllable');
        
        // Deshabilitar todas las cajas para evitar doble click
        disableSyllableBoxes(); 

        if (selectedSyllable === currentCorrectSyllable) {
            // ACIERTO
            selectedBox.classList.add('correct');
            completedCount++;
            countDisplay.textContent = completedCount;
            nextButton.classList.remove('hidden');
            instructionText.textContent = "¡Correcto! Pasa a la siguiente sílaba.";
            
        } else {
            // ERROR
            selectedBox.classList.add('incorrect');
            errorModal.classList.remove('hidden');
        }
    }
    
    /**
     * Reinicia la práctica para la siguiente sílaba.
     */
    function nextPractice() {
        initializePractice();
    }
    
    // --- Event Listeners ---
    
    // Al pulsar la bocina: Dispara la voz y HABILITA las opciones
    playButton.addEventListener('click', () => {
        // Solo reproducir si no se está esperando la selección
        if (isWaitingForListen) {
             speakSyllable(currentCorrectSyllable);
        } else {
             // Si ya la escucharon, permite que la escuchen de nuevo
             speakSyllable(currentCorrectSyllable); 
        }
    });
    
    // Al pulsar el botón Siguiente
    nextButton.addEventListener('click', nextPractice);
    
    // Al pulsar el botón 'Entendido' del pop-up de error
    closeModalButton.addEventListener('click', () => {
        errorModal.classList.add('hidden');
        
        // Después del error, re-habilitar las cajas para otro intento
        document.querySelectorAll('.syllable-box').forEach(box => {
            if (!box.classList.contains('correct')) {
                 box.classList.remove('incorrect');
                 box.classList.remove('disabled'); // Asegurar que no quede deshabilitada
                 box.addEventListener('click', handleSelection);
            }
        });
        
        // Volver a reproducir la sílaba después de un error, por si lo olvidó
        speakSyllable(currentCorrectSyllable);
    });

    // Iniciar la primera práctica
    initializePractice();
});
