const userId = localStorage.getItem("userId");
const userType = localStorage.getItem("userType");

console.log("ID do usuário:", userId);
console.log("Tipo de usuário:", userType);

if (!userId || !userType) {
    alert("Erro: Usuário não autenticado. Faça login novamente.");
    window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Erro: Usuário não autenticado. Faça login novamente.");
        window.location.href = "login.html";
        return;
    }     
    carregarEquipamentos();
    carregarSolicitacoes(userId);
    carregarPerfil(userId);

    document.getElementById("editar-perfil-form").addEventListener("submit", (e) => {
        e.preventDefault();
        atualizarPerfil(userId);
    });
});

function showSection(section) {
    document.querySelectorAll(".content").forEach(div => div.style.display = "none");
    document.getElementById(section).style.display = "block";
    document.querySelectorAll(".menu a").forEach(link => link.classList.remove("active"));
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add("active");
}

async function carregarEquipamentos() {
    try {
        const response = await fetch("http://localhost:3000/equipamentos");
        const data = await response.json();
        if (data.success) {
            const container = document.getElementById("equipamentos-container");
            container.innerHTML = "";
            data.data.forEach(equipamento => {
                const card = document.createElement("div");
                card.classList.add("equipamento-card");
                card.innerHTML = `
                    <img src="${equipamento.capa}" alt="${equipamento.nomenclatura}">
                    <h3>${equipamento.nomenclatura}</h3>
                    <button onclick="solicitarEquipamento(${userId},${equipamento.id})">Solicitar</button>
                    <button onclick="verDetalhes(${equipamento.id})">Detalhes</button>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
    }
}

async function solicitarEquipamento(userId, equipamentoId) {
    const dataM = prompt("Escolha a data de realização (YYYY-MM-DD HH:MM)");
    //validação do formato da data de realização
    const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
    if (!regex.test(dataM)) {
        alert("Formato de data de realização inválido. Use o formato YYYY-MM-DD HH:MM");
        return;
    }
    const localizacao = prompt("Informe a localização");
    if (!dataM) return;
    try {
        const response = await fetch("http://localhost:3000/solicitacao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ClienteId: userId, EquipamentId: equipamentoId, Data: new Date().toISOString().split("T") [0] , Localizacao:localizacao, DataM: dataM })
        });
        const data = await response.json();
        alert(data.message);
        carregarSolicitacoes(1);
    } catch (error) {
        console.error("Erro ao solicitar equipamento:", error);
    }
}
async function verDetalhes(equipamentoId) {
    try {
        const response = await fetch(`http://localhost:3000/equipamento/${equipamentoId}`);
        const data = await response.json();

        if (data.success) {
            const equipamento = data.data;
            const detalhesContainer = document.getElementById("detalhes-equipamento");
            detalhesContainer.innerHTML = "<h2>Detalhes do Equipamento</h2>";

            // Percorre os atributos do equipamento e exibe apenas os que não são null/vazios
            for (const [chave, valor] of Object.entries(equipamento)) {
                if (valor !== null && valor !== "" && chave !== "id") {
                    detalhesContainer.innerHTML += `<p><strong>${formatarCampo(chave)}:</strong> ${valor}</p>`;
                }
            }

            detalhesContainer.innerHTML += `<button onclick="fecharDetalhes()">Fechar</button>`;
            detalhesContainer.style.display = "block";
        } else {
            alert("Equipamento não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes do equipamento:", error);
    }
}
// Função para carregar categorias no dropdown
async function carregarCategorias() {
    try {
        const response = await fetch("http://localhost:3000/categorias");
        const data = await response.json();
        const categoriaSelect = document.getElementById("search-categoria");

        if (data.success) {
            categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';   

            data.data.forEach(categoria => {
                const option = document.createElement("option");
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaSelect.appendChild(option);
            });
        } else {
            console.error("Erro ao carregar categorias.");
        }
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
    }
}

// Chamar a função para carregar categorias ao carregar a página
document.addEventListener("DOMContentLoaded", carregarCategorias);


// Função para formatar os nomes dos campos (exemplo: "categoriaId" → "Categoria ID")
function formatarCampo(nome) {
    return nome.replace(/([a-z])([A-Z])/g, "$1 $2") // Adiciona espaço antes das letras maiúsculas
               .replace(/^./, str => str.toUpperCase()); // Primeira letra maiúscula
}

// Função para fechar os detalhes
function fecharDetalhes() {
    document.getElementById("detalhes-equipamento").style.display = "none";
}

async function carregarSolicitacoes(userId) {
    try {
        const response = await fetch(`http://localhost:3000/clientes/${userId}/solicitacoes`);
        const data = await response.json();
        if (data.success) {
            const tableBody = document.getElementById("solicitacoes-table-body");
            tableBody.innerHTML = "";
            data.data.forEach(solicitacao => {
                const row = `<tr>
                    <td>${solicitacao.Localizacao}</td>
                    <td>${solicitacao.SOLICITADOR}</td>
                    <td>${solicitacao.EQUIPAMENTO}</td>
                    <td>${solicitacao.PRECO}</td>
                    <td>${solicitacao.Data}</td>
                    <td>${solicitacao.DataM}</td>
                    <td>${solicitacao.Status}</td>
                    <td>${solicitacao.Service}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
    }
}

async function filtrarEquipamentos() {
    const categoriaId = document.getElementById("search-categoria").value;
    const minPrice = document.getElementById("min-price").value;
    const maxPrice = document.getElementById("max-price").value;

    let url = "http://localhost:3000/equipamentos";

    if (categoriaId) {
        url = `http://localhost:3000/categorias/${categoriaId}/equipamentos`;
    } else if (minPrice && maxPrice) {
        url = `http://localhost:3000/preco?min=${minPrice}&max=${maxPrice}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        const container = document.getElementById("equipamentos-container");
        container.innerHTML = "";

        if (data.success) {
            data.data.forEach(equipamento => {
                // Garantindo que preco seja um número antes de chamar toFixed
                const precoFormatado = equipamento.preco 
                    ? Number(equipamento.preco).toFixed(2) 
                    : "N/A"; // Caso não tenha preço, mostrar "N/A"

                const card = document.createElement("div");
                card.classList.add("equipamento-card");
                card.innerHTML = `
                    <img src="${equipamento.capa || 'placeholder.jpg'}" alt="${equipamento.nomenclatura}">
                    <h3>${equipamento.nomenclatura}</h3>
                    <p>Preço: R$ ${precoFormatado}</p>
                    <button onclick="solicitarEquipamento(${equipamento.id})">Solicitar</button>
                    <button onclick="verDetalhes(${equipamento.id})">Detalhes</button>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = "<p>Nenhum equipamento encontrado.</p>";
        }
    } catch (error) {
        console.error("Erro ao filtrar equipamentos:", error);
    }
}




async function carregarPerfil(userId) {
    console.log("Tentando carregar perfil do cliente com ID:", userId);
    try {
        const response = await fetch(`http://localhost:3000/cliente/${userId}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            document.getElementById("nome").value = data.data.nome;
            document.getElementById("email").value = data.data.email;
            document.getElementById("contacto").value = data.data.contacto;
        } else {
            console.error("Erro no backend:", data.message);
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}


async function atualizarPerfil(userId) {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const contacto = document.getElementById("contacto").value;
    const password = document.getElementById("password").value;
    try {
        const response = await fetch(`http://localhost:3000/cliente/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, contacto, password })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
    }
}


document.querySelector(".logout").addEventListener("click", function() {
    // Redireciona para a tela de login
    window.location.href = "login.html";
});
