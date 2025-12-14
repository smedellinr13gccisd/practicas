document.addEventListener('DOMContentLoaded', () => {
    // Lista completa de sílabas comunes
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

    const optionsArea = document.getElementById('syllable-options');
    const playButton = document.getElementById('play-syllable-btn');
    const nextButton = document.getElementById('next-syllable-btn');
    const countDisplay = document.getElementById('completed-count');
    const errorModal = document.getElementById('error-modal');
    const closeModalButton = document.getElementById('close-modal-btn');
    const instructionText = document.querySelector('.instruction'); 
    
    // Referencia al bloqueador inicial (NUEVO)
    const initialBlocker = document.getElementById('initial-blocker');

    // --- Configuración de Voz (Se mantiene la optimización) ---
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
     * Usa la Web Speech API para leer la sílaba en voz alta y HABILITAR las opciones.
     */
    function speakSyllable(syllable) {
        if (!syllable) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        playButton.disabled = true;

        const utterance = new SpeechSynthesisUtterance(syllable);
        
        // Parámetros para voz clara e infantil
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
    
    /**
     * Habilita las cajas eliminando la clase de bloqueo inicial y añadiendo el listener.
     */
    function enableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            box.classList.remove('disabled-start'); 
            box.addEventListener('click', handleSelection); 
        });
    }

    /**
     * Deshabilita la interacción añadiendo la clase de bloqueo.
     */
    function disableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            box.classList.add('disabled-start');
            box.removeEventListener('click', handleSelection);
        });
    }
    
    /**
     * Obtiene opciones al azar.
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
     * Inicializa una nueva práctica de sílaba (con las cajas bloqueadas).
     */
    function initializePractice() {
        const options = generateOptions();
        
        optionsArea.innerHTML = ''; 
        nextButton.classList.add('hidden');
        instructionText.textContent = "Pulsa la bocina para escuchar la sílaba.";
        playButton.disabled = false;

        options.forEach(syllable => {
            const box = document.createElement('div');
            // INICIA BLOQUEADO por CSS para prevenir toque fantasma en iOS
            box.className = 'syllable-box disabled-start'; 
            box.textContent = syllable.toUpperCase(); 
            box.setAttribute('data-syllable', syllable);
            optionsArea.appendChild(box);
        });
        
        disableSyllableBoxes(); 
    }
    
    /**
     * Maneja la selección de una caja.
     */
    function handleSelection(event) {
        
        const selectedBox = event.target;
        const selectedSyllable = selectedBox.getAttribute('data-syllable');
        
        // Bloquear todas las cajas inmediatamente después de la selección
        disableSyllableBoxes(); 

        if (selectedSyllable === currentCorrectSyllable) {
            // ACIERTO
            selectedBox.classList.remove('disabled-start');
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
    
    function nextPractice() {
        initializePractice();
    }
    
    // --- Event Listeners ---
    
    playButton.addEventListener('click', () => {
        playButton.disabled = true;
        speakSyllable(currentCorrectSyllable);
    });
    
    nextButton.addEventListener('click', nextPractice);
    
    // Lógica al cerrar el pop-up de error
    closeModalButton.addEventListener('click', () => {
        errorModal.classList.add('hidden');
        
        // 1. Quitar el color rojo
        document.querySelectorAll('.syllable-box').forEach(box => {
            if (!box.classList.contains('correct')) {
                 box.classList.remove('incorrect');
            }
        });
        
        // 2. Re-habilitar interacción y volver a reproducir
        enableSyllableBoxes();
        speakSyllable(currentCorrectSyllable);
    });

    // CORRECCIÓN CRÍTICA FINAL: Retraso de 500ms + ELIMINAR BLOQUEADOR DE PANTALLA
    setTimeout(() => {
        initializePractice();
        
        // ELIMINAR el bloqueador de pantalla completa DESPUÉS de la inicialización
        if (initialBlocker) {
            initialBlocker.style.display = 'none';
        }
        
    }, 500); 
});
