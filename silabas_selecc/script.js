document.addEventListener('DOMContentLoaded', () => {
    // Lista completa de sílabas comunes (Vocal-Consonante y Consonante-Vocal)
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
        // Sílabas con vocal inicial (Vocal-Consonante)
        "al", "el", "il", "ol", "ul", "an", "en", "in", "on", "un",
        "ar", "er", "ir", "or", "ur", "as", "es", "is", "os", "us",
        "am", "em", "im", "om", "um"
    ];
    
    const NUM_OPTIONS = 5;
    let currentCorrectSyllable = '';
    let completedCount = 0;
    let errorCount = 0;
    let preferredVoice = null; 
    let isInitialized = false; // Bandera para controlar la primera pulsación y el estado del juego

    const optionsArea = document.getElementById('syllable-options');
    const playButton = document.getElementById('play-syllable-btn');
    const nextButton = document.getElementById('next-syllable-btn');
    const countDisplay = document.getElementById('completed-count');
    const errorCountDisplay = document.getElementById('error-count');
    
    // Elementos del Modal Unificado
    const mainModal = document.getElementById('main-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalActionButton = document.getElementById('modal-action-btn');

    const instructionText = document.querySelector('.instruction'); 
    const initialBlocker = document.getElementById('initial-blocker');

    // --- Configuración de Voz (Optimización) ---
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
     * Muestra el modal con el mensaje y estilo apropiados.
     */
    function showModal(isCorrect) {
        // DOBLE PROTECCIÓN: Si el juego no ha sido inicializado, no se abre ningún modal.
        if (!isInitialized) return; 

        mainModal.classList.remove('hidden', 'modal-error', 'modal-success');
        
        if (isCorrect) {
            mainModal.classList.add('modal-success');
            modalMessage.textContent = "¡Correcto! Pasa a la siguiente sílaba. 🎉";
            modalActionButton.textContent = "Siguiente";
        } else {
            mainModal.classList.add('modal-error');
            modalMessage.textContent = "¡Incorrecto! Vuelve a intentarlo. 🤔";
            modalActionButton.textContent = "Entendido";
        }
    }
    
    function speakSyllable(syllable) {
        if (!syllable) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        playButton.disabled = true;

        const utterance = new SpeechSynthesisUtterance(syllable);
        
        utterance.rate = 0.9;  
        utterance.pitch = 1.2; 
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
            utterance.lang = preferredVoice.lang; 
        } else {
            utterance.lang = 'es-MX';
        }

        speechSynthesis.speak(utterance);
        
        // Habilitar interacción SOLAMENTE cuando la voz empieza a sonar
        utterance.onstart = () => {
             enableSyllableBoxes();
             instructionText.textContent = "¡Selecciona la sílaba correcta!";
        };
        
        // Re-habilitar el botón de bocina al finalizar
        utterance.onend = () => {
             playButton.disabled = false;
        };
    }
    
    function enableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            if (!box.classList.contains('correct')) { 
                box.classList.remove('disabled-start'); 
                box.addEventListener('click', handleSelection); 
            }
        });
    }

    function disableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            box.classList.add('disabled-start');
            box.removeEventListener('click', handleSelection);
        });
    }
    
    function generateOptions() {
        const shuffledSyllables = [...allSyllables].sort(() => 0.5 - Math.random());
        currentCorrectSyllable = shuffledSyllables[0];
        let incorrectOptions = shuffledSyllables.slice(1, NUM_OPTIONS);
        let options = [currentCorrectSyllable, ...incorrectOptions];
        options.sort(() => 0.5 - Math.random());
        return options;
    }

    /**
     * Inicializa una nueva práctica de sílaba, genera las cajas y las bloquea.
     */
    function initializePractice() {
        const options = generateOptions();
        
        optionsArea.innerHTML = ''; 
        nextButton.classList.add('hidden');
        instructionText.textContent = "Pulsa la bocina para escuchar la sílaba.";
        
        options.forEach(syllable => {
            const box = document.createElement('div');
            // Las cajas se crean bloqueadas, se habilitarán al hablar
            box.className = 'syllable-box disabled-start'; 
            box.textContent = syllable.toUpperCase(); 
            box.setAttribute('data-syllable', syllable);
            optionsArea.appendChild(box);
        });
        
        disableSyllableBoxes(); 
    }
    
    function handleSelection(event) {
        
        const selectedBox = event.target;
        const selectedSyllable = selectedBox.getAttribute('data-syllable');
        
        disableSyllableBoxes(); 

        if (selectedSyllable === currentCorrectSyllable) {
            // ACIERTO
            selectedBox.classList.remove('disabled-start');
            selectedBox.classList.remove('incorrect'); // Limpieza
            selectedBox.classList.add('correct');
            
            completedCount++;
            countDisplay.textContent = completedCount;
            
            showModal(true); // Mostrar modal de éxito
            
        } else {
            // ERROR
            selectedBox.classList.add('incorrect');
            errorCount++;
            errorCountDisplay.textContent = errorCount;
            
            showModal(false); // Mostrar modal de error
        }
    }
    
    function nextPractice() {
        mainModal.classList.add('hidden');
        initializePractice();
        // Después de la siguiente práctica, volver a reproducir
        speakSyllable(currentCorrectSyllable); 
    }
    
    // --- Event Listeners ---
    
    playButton.addEventListener('click', () => {
        
        // Lógica de Primera Inicialización (CRÍTICO)
        if (!isInitialized) {
            // 1. Genera las 5 cajas de sílabas por primera vez
            initializePractice();
            isInitialized = true; // El juego ya está inicializado
        }
        
        // 2. Hablar la sílaba (ya sea la primera vez o una repetición)
        playButton.disabled = true;
        speakSyllable(currentCorrectSyllable);
    });
    
    // Manejador del botón del modal (unificado para acierto/error)
    modalActionButton.addEventListener('click', () => {
        
        if (mainModal.classList.contains('modal-success')) {
             // Si fue acierto, pasar a la siguiente práctica (el modal se cierra dentro de nextPractice)
             nextPractice(); 
             
        } else {
            // Si fue error, cerrar el modal, limpiar el rojo y re-habilitar
            mainModal.classList.add('hidden');
            
            // 1. Quitar el color rojo de la caja incorrecta
            document.querySelectorAll('.syllable-box').forEach(box => {
                if (!box.classList.contains('correct')) {
                     box.classList.remove('incorrect');
                }
            });
            
            // 2. Re-habilitar interacción y volver a reproducir la sílaba
            enableSyllableBoxes();
            speakSyllable(currentCorrectSyllable);
        }
    });

    // --- CÓDIGO FINAL DE HABILITACIÓN AL CARGAR ---
    
    // 1. Eliminar el bloqueador de pantalla completa
    if (initialBlocker) {
        initialBlocker.style.display = 'none';
    }
    
    // 2. HABILITAR EL BOTÓN DE BOCINA (permitiendo la interacción por primera vez)
    // Esto se hace explícitamente al final del DOMContentLoaded para garantizar que todo esté listo.
    playButton.disabled = false;
});
