const fotoPessoa = document.getElementById('fotoPessoa');
const fotoCriatura = document.getElementById('fotoCriatura');
const previewPessoa = document.getElementById('previewPessoa');
const previewCriatura = document.getElementById('previewCriatura');
const resultado = document.getElementById('resultado');
const dadosSalvos = document.getElementById('dadosSalvos');
const loading = document.getElementById('loading');
const form = document.getElementById('creatureForm');
const threatLevelContainer = document.getElementById('threatLevel');
const threatOptions = document.querySelectorAll('.threat-option');
const magicSignatureDiv = document.getElementById('magicSignature');
const signatureTextSpan = document.getElementById('signatureText');
const salvarButton = document.getElementById('salvar');

// Sons
const swooshSound = document.getElementById('swooshSound');
const errorSound = document.getElementById('errorSound');
const successSound = document.getElementById('successSound');


// **ATENÇÃO:** Mantenha a URL do seu Script do Google Apps aqui
const scriptURL = "https://script.google.com/macros/s/AKfycbwkGQ6YFcO2IBR00pHsG1Lsho6Aaxck7mz2RZZZIQkUG4xqK64_A0poubvMt5gIYmC/exec"; 

// --- Funções de Ajuda ---

/**
 * Função para pré-visualizar a imagem selecionada.
 */
function previewImage(input, container) {
  container.innerHTML = "";
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = "w-full h-full object-cover rounded-md border-2 border-emerald-700 shadow-lg"; /* Imagem ocupa todo o preview */
      container.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

fotoPessoa.addEventListener('change', () => previewImage(fotoPessoa, previewPessoa));
fotoCriatura.addEventListener('change', () => previewImage(fotoCriatura, previewCriatura));

/**
 * Converte um arquivo em Base64 para envio.
 */
const getBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  if (file) reader.readAsDataURL(file);
  else resolve("");
});

// --- Nível de Ameaça (Interatividade) ---
let currentThreatLevel = 'instavel'; // Define um padrão inicial

threatOptions.forEach(option => {
  option.addEventListener('click', () => {
    // Remove 'active' de todas as opções
    threatOptions.forEach(opt => opt.classList.remove('active'));
    // Adiciona 'active' à opção clicada
    option.classList.add('active');
    
    currentThreatLevel = option.dataset.level;

    // Remove todas as classes de threat-level do body
    document.body.classList.remove('threat-level-baixo', 'threat-level-controlado', 'threat-level-instavel', 'threat-level-letal');
    // Adiciona a classe correspondente ao nível de ameaça atual
    document.body.classList.add(`threat-level-${currentThreatLevel}`);
  });
});

// Inicializa a classe no body ao carregar
document.body.classList.add(`threat-level-${currentThreatLevel}`);


// --- Efeito de Assinatura Mágica ---
const registrantName = "Departamento de Criatuas"; // Nome fixo ou pode vir de um input futuramente
const typingDelay = 100; // ms por caractere
const eraseDelay = 50; // ms por caractere ao apagar
const waitDelay = 2000; // ms antes de apagar/digitar novamente

function typeSignature(text, element, callback) {
  let i = 0;
  element.textContent = ''; // Limpa o texto
  const typingInterval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, typingDelay);
}

function eraseSignature(element, callback) {
  let text = element.textContent;
  let i = text.length - 1;
  const erasingInterval = setInterval(() => {
    if (i >= 0) {
      element.textContent = text.substring(0, i);
      i--;
    } else {
      clearInterval(erasingInterval);
      if (callback) callback();
    }
  }, eraseDelay);
}

function animateSignature() {
  typeSignature(registrantName, signatureTextSpan, () => {
    setTimeout(() => {
      eraseSignature(signatureTextSpan, () => {
        setTimeout(animateSignature, waitDelay); // Reinicia o ciclo
      });
    }, waitDelay);
  });
}

// Inicia a animação quando a div de assinatura estiver visível
const signatureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateSignature();
      signatureObserver.unobserve(entry.target); // Observa apenas uma vez
    }
  });
}, { threshold: 0.5 }); // Detecta quando 50% da div está visível

signatureObserver.observe(magicSignatureDiv);


// --- Lógica de Envio do Formulário ---
salvarButton.addEventListener('click', async () => {
  const nome = document.getElementById('nome').value.trim();
  const idade = document.getElementById('idade').value.trim();
  const especie = document.getElementById('especie').value.trim();
  const vinculoArcano = document.getElementById('vinculoArcano').value.trim();
  const ultimaManifestacao = document.getElementById('ultimaManifestacao').value.trim();
  const nivelAmeaca = currentThreatLevel; // Pega o nível de ameaça selecionado

  // Validação dos campos
  if (!nome || !idade || !especie || !vinculoArcano || !ultimaManifestacao || !nivelAmeaca) {
    errorSound.play();
    alert("🧙 Atenção: Todos os campos de texto e seleção devem ser preenchidos para iniciar o registro arcano.");
    return;
  }
  
  if (!fotoPessoa.files[0] || !fotoCriatura.files[0]) {
    errorSound.play();
    alert("📸 Por favor, anexe retratos tanto do Registrante quanto da Criatura antes de submeter ao arquivo sombrio.");
    return;
  }

  // Toca som de swoosh ao clicar no botão
  swooshSound.play();

  const fotoPessoa64 = await getBase64(fotoPessoa.files[0]);
  const fotoCriatura64 = await getBase64(fotoCriatura.files[0]);

  const dados = { 
    nome, 
    idade, 
    especie, 
    nivelAmeaca, 
    vinculoArcano, 
    ultimaManifestacao, 
    registrante: registrantName, // Adiciona o nome do registrante fixo
    fotoPessoa: fotoPessoa64, 
    fotoCriatura: fotoCriatura64 
  };

  // Exibe a tela de carregamento
  resultado.classList.add('hidden');
  loading.classList.remove('hidden');

  try {
    // Simulação de envio para evitar erros com o script do GAS desativado.
    // Você pode descomentar o bloco 'fetch' abaixo e remover este 'setTimeout' quando tiver seu Apps Script pronto.
    await new Promise(resolve => setTimeout(resolve, 3000)); 

    /*
    // CÓDIGO REAL DE ENVIO (Descomente se o Script do GAS estiver ativo e configurado)
    await fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(dados)
    });
    */

    loading.classList.add('hidden');
    
    // Mostra mensagem de sucesso com efeitos
    successSound.play();
    resultado.classList.remove('hidden');
    dadosSalvos.innerHTML = `
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Idade:</strong> ${idade} anos</p>
      <p><strong>Espécie:</strong> ${especie}</p>
      <p><strong>Nível de Ameaça:</strong> <span class="text-emerald-300">${nivelAmeaca.toUpperCase()}</span></p>
      <p><strong>Vínculo Arcano:</strong> ${vinculoArcano}</p>
      <p><strong>Última Manifestação:</strong> ${ultimaManifestacao}</p>
      <p><strong>Registrante:</strong> ${registrantName}</p>
      <p class="italic text-gray-400 mt-3 border-t border-gray-700 pt-2">Registro autenticado pelo Círculo Arcano. Os Antigos foram notificados.</p>
    `;

    // Adiciona o selo de sucesso com animação
    const successSeal = document.createElement('div');
    successSeal.className = 'success-seal';
    form.appendChild(successSeal);
    setTimeout(() => {
        successSeal.remove(); // Remove o selo após a animação
        form.reset(); // Limpa o formulário
        previewPessoa.innerHTML = ''; // Limpa previews
        previewCriatura.innerHTML = '';
        signatureTextSpan.textContent = ''; // Limpa assinatura
        // Reseta o nível de ameaça visualmente se desejar
        threatOptions.forEach(opt => opt.classList.remove('active'));
        document.querySelector('.threat-option[data-level="instavel"]').classList.add('active');
        document.body.classList.remove('threat-level-baixo', 'threat-level-controlado', 'threat-level-letal');
        document.body.classList.add('threat-level-instavel');
        currentThreatLevel = 'instavel';
    }, 3000); // Tempo para a animação do selo
    
    alert("💀 Registro SOMBRIO enviado com sucesso ao Arquivo Oculto do Imperiuz!");

  } catch (err) {
    loading.classList.add('hidden');
    errorSound.play();
    alert("❌ Falha ao enviar registro. Verifique sua conexão e o Script do Google Apps: " + err.message);
  }
});
