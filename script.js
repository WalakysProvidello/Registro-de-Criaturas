const fotoPessoa = document.getElementById('fotoPessoa');
const fotoCriatura = document.getElementById('fotoCriatura');
const previewPessoa = document.getElementById('previewPessoa');
const previewCriatura = document.getElementById('previewCriatura');
const resultado = document.getElementById('resultado');
const dadosSalvos = document.getElementById('dadosSalvos');
const loading = document.getElementById('loading');
const form = document.getElementById('creatureForm');

// **ATENÇÃO:** Mantenha a URL do seu Script do Google Apps aqui
const scriptURL = "https://script.google.com/macros/s/AKfycbwkGQ6YFcO2IBR00pHsG1Lsho6Aaxck7mz2RZZZIQkUG4xqK64_A0poubvMt5gIYmC/exec"; 

/**
 * Função para pré-visualizar a imagem selecionada.
 */
function previewImage(input, container) {
  container.innerHTML = "";
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      const divWrapper = document.createElement('div');
      divWrapper.className = "image-preview-ring rounded-full";
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = "rounded-full w-24 h-24 object-cover"; 
      divWrapper.appendChild(img);
      container.appendChild(divWrapper);
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

document.getElementById('salvar').addEventListener('click', async () => {
  const nome = document.getElementById('nome').value.trim();
  const idade = document.getElementById('idade').value.trim();
  const especie = document.getElementById('especie').value.trim();
  const sexo = document.getElementById('sexo').value.trim();
  const tamanho = document.getElementById('tamanho').value.trim();

  // Validação dos campos
  if (!nome || !idade || !especie || !sexo || !tamanho) {
    alert("🧙 Atenção: Todos os campos de texto devem ser preenchidos para iniciar o registro arcano.");
    return;
  }
  
  if (!fotoPessoa.files[0] || !fotoCriatura.files[0]) {
    alert("📸 Por favor, anexe retratos tanto do Registrante quanto da Criatura.");
    return;
  }

  const fotoPessoa64 = await getBase64(fotoPessoa.files[0]);
  const fotoCriatura64 = await getBase64(fotoCriatura.files[0]);

  const dados = { nome, idade, especie, sexo, tamanho, fotoPessoa: fotoPessoa64, fotoCriatura: fotoCriatura64 };

  // Exibe a tela de carregamento
  resultado.classList.add('hidden');
  loading.classList.remove('hidden');

  
  try {
    // Tenta enviar os dados (POST)
    await fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(dados)
    });
    
    // Sucesso
    loading.classList.add('hidden');
    resultado.classList.remove('hidden');
    form.reset();
    previewPessoa.innerHTML = '';
    previewCriatura.innerHTML = '';

    dadosSalvos.innerHTML = `
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Idade:</strong> ${idade} anos</p>
      <p><strong>Espécie:</strong> ${especie}</p>
      <p><strong>Sexo:</strong> ${sexo}</p>
      <p><strong>Tamanho:</strong> ${tamanho}</p>
      <p class="italic text-yellow-400 mt-3 border-t border-yellow-700 pt-2">Registro autenticado pela Imperius. Um Mestre Mago validará o Arquivo em breve.</p>
    `;
    alert("✅ Registro enviado com sucesso ao Arquivo Imperius!");

  } catch (err) {
    // Erro
    loading.classList.add('hidden');
    alert("❌ Falha ao enviar registro. Verifique sua conexão e o Script do Google Apps: " + err.message);
  }
});
