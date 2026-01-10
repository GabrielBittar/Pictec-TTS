function loadApiKey(apiKeyInput, statusDiv){
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if(result.geminiApiKey){
            apiKeyInput.value = result.geminiApiKey;
            statusDiv.textContent = "Chave carregada. Pronto para usar";
        }else{
            statusDiv.textContent = "Insira sua chave da API do Gemini";
        }
    });
}