// content.js - Injetado na página web para interagir com o DOM e o motor TTS.

// --- CONFIGURAÇÕES TTS ---
const TTS_RATE = 1.2; // Velocidade de leitura (1.0 = normal, 1.2 = 20% mais rápido)
const TTS_PITCH = 1.0; // Tom da voz
const LANG_CODE = 'pt-BR';
// --- CONFIGURAÇÕES TTS ---

// Variável para armazenar a voz preferida
let selectedVoice = null;

// Função para encontrar a melhor voz disponível
function getPreferredVoice(voiceList) {
    // Tenta encontrar uma voz específica e de alta qualidade
    const preferredVoiceName = 'Google português do Brasil';
    
    // 1. Tenta a voz de alta qualidade
    selectedVoice = voiceList.find(voice => 
        voice.name === preferredVoiceName && voice.lang === LANG_CODE
    );

    // 2. Se não encontrar, pega a primeira voz que fala português do Brasil
    if (!selectedVoice) {
        selectedVoice = voiceList.find(voice => voice.lang === LANG_CODE);
    }
    
    // 3. Se ainda não encontrar, usa a primeira voz disponível
    if (!selectedVoice) {
        selectedVoice = voiceList[0];
    }
}

// Carrega as vozes imediatamente se estiverem disponíveis, senão espera pelo evento
function initializeVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
        getPreferredVoice(voices);
    } else {
        speechSynthesis.onvoiceschanged = () => {
            getPreferredVoice(speechSynthesis.getVoices());
        };
    }
}

// Inicializa o carregamento das vozes
initializeVoices();


/**
 * Reproduz o texto fornecido usando o motor TTS do navegador.
 * @param {string} text O texto a ser lido em voz alta.
 */
function speakDescription(text) {
    // Cancela qualquer fala anterior
    speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurações de voz
    utterance.rate = TTS_RATE;
    utterance.pitch = TTS_PITCH;
    utterance.lang = LANG_CODE;
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    // Inicia a leitura
    speechSynthesis.speak(utterance);
    
    console.log(`TTS iniciado com sucesso para: ${text.substring(0, 50)}...`);
}

/**
 * Exibe uma mensagem de status temporária na parte superior da página.
 * @param {string} message A mensagem a ser exibida.
 * @param {boolean} isError Indica se é uma mensagem de erro.
 */
function showStatusMessage(message, isError = false) {
    let statusBox = document.getElementById('gemini-tts-status-box');
    
    if (!statusBox) {
        statusBox = document.createElement('div');
        statusBox.id = 'gemini-tts-status-box';
        // Estilos para a caixa de status flutuante
        statusBox.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            font-weight: 600;
            color: white;
            transition: all 0.3s ease-in-out;
            opacity: 0;
            visibility: hidden;
        `;
        document.body.appendChild(statusBox);
    }

    statusBox.textContent = message;
    
    if (isError) {
        statusBox.style.backgroundColor = '#dc2626'; // Vermelho para erro
    } else if (message.includes("Analisando")) {
        statusBox.style.backgroundColor = '#fcd34d'; // Amarelo para status
        statusBox.style.color = '#333';
    } else {
        statusBox.style.backgroundColor = '#10b981'; // Verde para sucesso
    }

    // Mostra a caixa
    statusBox.style.opacity = '1';
    statusBox.style.visibility = 'visible';
    
    // Esconde a caixa após 4 segundos
    setTimeout(() => {
        statusBox.style.opacity = '0';
        statusBox.style.visibility = 'hidden';
    }, 4000);
}

// --- NOVO: Listener para receber a descrição do background.js ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.error) {
        showStatusMessage(request.error, true);
        speakDescription(request.error);
    } else if (request.description) {
        // Sucesso: Reproduz a descrição
        showStatusMessage("Descrição recebida. Iniciando leitura...", false);
        speakDescription(request.description);
    } else if (request.status) {
        // Status: Mostra que a análise começou
        showStatusMessage(request.status);
    }
});