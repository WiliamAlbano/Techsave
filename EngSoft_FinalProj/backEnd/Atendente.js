const userId = localStorage.getItem("userId");
const userType = localStorage.getItem("userType");

console.log("ID do usuário:", userId);
console.log("Tipo de usuário:", userType);

if (!userId || !userType) {
    alert("Erro: Usuário não autenticado. Faça login novamente.");
    window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", () => {
    carregarSolicitacoes();
    carregarCategorias();
});

function showSection(sectionId, element) {
    document.querySelectorAll('.content').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');

    document.querySelectorAll('.menu a').forEach(link => {
        link.classList.remove('active');
    });

    element.classList.add('active');

    // Carregar equipamentos ao abrir a seção de Equipamentos
    if (sectionId === "equipamentos") {
        loadEquipamentos();
    }
}

function carregarCategorias() {
    fetch('http://localhost:3000/categorias')
        .then(response => response.json())
        .then(data => {
            const categoriaSelect = document.getElementById("categoriaId");
            categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>'; // Limpa opções

            data.data.forEach(categoria => {
                let option = document.createElement("option");
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Erro ao carregar categorias:", error));
}
//Solicitações
function carregarSolicitacoes() {
    fetch('http://localhost:3000/solicitacoes')
    .then(response => response.json())
    .then(data => {
        console.log("Resposta da API:", data);  
        
        if (!data.success || !Array.isArray(data.data)) {
            throw new Error("Formato de resposta inesperado");
        }

        const tableBody = document.querySelector("#solicitacoesTable tbody");
        tableBody.innerHTML = "";

        data.data.forEach(solicitacao => {  // Aqui usamos "data.data"
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${solicitacao.id}</td>
                <td>${solicitacao.SOLICITADOR}</td>
                <td>${solicitacao.Email}</td>
                <td>${solicitacao.EQUIPAMENTO}</td>
                <td>${solicitacao.preco}</td>
                <td>${solicitacao.Data}</td>
                <td>${solicitacao.DataM}</td>
                <td>${solicitacao.localizacao}</td>
                <td>${solicitacao.Service}</td>
                <td>${solicitacao.Status}</td>
                <td>
                    ${solicitacao.Status === 'Pendente' ? `
                    <button onclick="aceitarSolicitacao(${solicitacao.id},'${solicitacao.Email}',${solicitacao.clienteId},${solicitacao.equipamentoId},${userId},'${solicitacao.Data}','${solicitacao.localizacao}','${solicitacao.DataM}','${solicitacao.Status}','${solicitacao.Service}')">Aceitar</button>
                    <br>
                    <br>
                    <button onclick="rejeitarSolicitacao(${solicitacao.id},'${solicitacao.Email}')">Rejeitar</button>` 
                    : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => console.error('Erro ao carregar solicitações:', error));
}
function formatarDataParaMySQL(dataISO) {
    const data = new Date(dataISO);
    // Ajustar para o fuso horário de Angola (UTC+1)
    data.setHours(data.getHours() + 1);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

// Aceitar solicitação (selecionar técnico, atualizar status e registrar venda)
function aceitarSolicitacao(id, email, clienteId, equipamentoId, userId, Data, localizacao, DataM, Status, Service) {
    fetch('http://localhost:3000/tecnicos')
        .then(response => response.json()) // Converte para JSON
        .then(data => {
            console.log("Resposta do servidor:", data); // Debug
            if (!data.success) {
                throw new Error("Erro ao buscar técnicos");
            }
            return data.data; // Retorna apenas o array de técnicos
        })
        .then(tecnicos => {
            let tecnicoSelect = prompt("Selecione um técnico:\n" + 
                tecnicos.map(tec => `${tec.id} - ${tec.nome}`).join("\n"));

            if (tecnicoSelect) {
                // Encontrar o nome do técnico pelo ID selecionado
                let tecnicoNome = tecnicos.find(tec => tec.id == tecnicoSelect)?.nome ;
                // Converter as datas antes de enviar
                const dataFormatada = formatarDataParaMySQL(Data);
                const dataMFormatada = formatarDataParaMySQL(DataM);
                fetch(`http://localhost:3000/solicitacao/emCurso/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tecnicoId: tecnicoSelect, Status: "Em Curso" }),
                })
                .then(() => {
// Registra a venda na tabela vendafeita
          return fetch('http://localhost:3000/vendaFeita', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
            ClienteId: clienteId,
            EquipamentId: equipamentoId,
            AtendenteId: userId,  
            TecnicoId: Number(tecnicoSelect),
            Data: dataFormatada,
            localizacao: localizacao,
            DataM: dataMFormatada,
            Status: "Em curso",
            Service: Service 
        })
      });
    })
                .then(() => {
                    // Enviar e-mail ao cliente informando que a solicitação foi aceita
                    return fetch('http://localhost:3000/enviarEmail', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: email,
                            assunto: "Solicitação Aceite!",
                            mensagem: `Olá, sua solicitação foi aceite e está em andamento com o técnico ${tecnicoNome}.`
                        })
                    });
                })
                .then(() => {
                    carregarSolicitacoes(); // Atualiza a tela
                })
                .catch(error => console.error('Erro ao processar solicitação:', error));
            }
        })
        .catch(error => console.error('Erro ao buscar técnicos:', error));
}

// Rejeitar solicitação (atualiza status e envia e-mail)
function rejeitarSolicitacao(id,email ) {
    fetch(`http://localhost:3000/solicitacao/rejeitar/${id}`, { method: 'PUT' })
        .then(() => {
            // Enviar e-mail ao cliente informando que a solicitação foi rejeitada
            fetch('http://localhost:3000/enviarEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    assunto: "Solicitação rejeitada",
                    mensagem: "Infelizmente, sua solicitação foi rejeitada. Para mais detalhes, entre em contato conosco."
                })
            });

            carregarSolicitacoes(); // Atualiza a tela
        })
        .catch(error => console.error('Erro ao rejeitar solicitação:', error));
}

// Adicionar equipamento
function addEquipamento() {
    const form = document.getElementById('addEquipamentoForm');
    const formData = new FormData(form);
    
    const equipamentoData = Object.fromEntries(formData.entries());
    
    fetch('http://localhost:3000/equipamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipamentoData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert("Equipamento adicionado com sucesso!");
    })
    .catch(error => console.error("Erro ao adicionar equipamento:", error));
    
}

// Carregar equipamentos registrados
async function loadEquipamentos() {
    try {
        const response = await fetch("http://localhost:3000/equipamentos");
        const data = await response.json();
        const tableBody = document.querySelector("#equipamentosTable tbody");
        tableBody.innerHTML = "";

        data.data.forEach((equipamento) => {
            const row = `<tr>
                <td>${equipamento.id}</td>
                <td>${equipamento.nomenclatura}</td>
                <td>${equipamento.preco}</td>
                <td>${equipamento.qtd}</td>
                <td>${equipamento.categoriaId}</td>
                <td>
                    <button onclick="deleteEquipamento(${equipamento.id})">Excluir</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
    }
}

// Excluir equipamento
async function deleteEquipamento(id) {
    if (!confirm("Tem certeza que deseja excluir este equipamento?")) return;
    
    try {
        const response = await fetch(`http://localhost:3000/equipamentos/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Equipamento excluído com sucesso!");
            loadEquipamentos(); // Recarregar a lista
        } else {
            alert("Erro ao excluir equipamento.");
        }
    } catch (error) {
        console.error("Erro ao excluir equipamento:", error);
    }
}

// Atualizar perfil
function updatePerfil() {
    const form = document.getElementById('updatePerfilForm');
    const formData = new FormData(form);
    let perfilData = {};

    formData.forEach((value, key) => {
        if (value.trim() !== "") {
            perfilData[key] = value;
        }
    });

    fetch(`http://localhost:3000/atendente/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfilData)
    })
    .then(response => response.json())
    .then(() => alert("Perfil atualizado com sucesso!"));
}

// Logout
function logout() {
    window.location.href = "login.html";
}
