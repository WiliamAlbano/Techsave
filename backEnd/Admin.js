const userId = localStorage.getItem("userId");
const userType = localStorage.getItem("userType");

console.log("ID do usuário:", userId);
console.log("Tipo de usuário:", userType);

if (!userId || !userType) {
    alert("Erro: Usuário não autenticado. Faça login novamente.");
    window.location.href = "login.html";
}
function showSection(section) {
    document.querySelectorAll('.content').forEach(div => div.style.display = 'none');
    document.getElementById(section).style.display = 'block';
    document.querySelectorAll('.menu a').forEach(link => link.classList.remove('active'));
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
}
document.addEventListener("DOMContentLoaded", () => {
    loadEquipamentos();

    document.getElementById("addEquipamentoForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        // Captura dos valores
        const nomenclatura = document.getElementById("nomenclatura").value.trim();
        const preco = document.getElementById("preco").value ? parseFloat(document.getElementById("preco").value) : null;
        const qtd = document.getElementById("qtd").value ? parseInt(document.getElementById("qtd").value) : 0;
        const Cor = document.getElementById("cor").value.trim();
        const categoriaId = document.getElementById("categoriaId").value || null;

        // Captura dos inputs sem ID usando name
        const Compatibilidade = document.querySelector("[name='Compatibilidade']").value.trim() || null;
        const RAM = document.querySelector("[name='RAM']").value.trim() || null;
        const ROM = document.querySelector("[name='ROM']").value.trim() || null;
        const Comprimento = document.querySelector("[name='Comprimento']").value ? parseFloat(document.querySelector("[name='Comprimento']").value) : null;
        const WIFI = document.querySelector("[name='WIFI']").value.trim() || null;
        const SO = document.querySelector("[name='SO']").value.trim() || null;
        const Ethernet = document.querySelector("[name='Ethernet']").value.trim() || null;
        const Resolucao = document.querySelector("[name='Resolucao']").value.trim() || null;
        const grafico = document.querySelector("[name='Grafico']").value.trim() || null;
        const HDMI = document.querySelector("[name='HDMI']").value.trim() || null;
        const USB = document.querySelector("[name='USB']").value.trim() || null;
        const Bluetooth = document.querySelector("[name='Bluetooth']").value.trim() || null;
        const Processador = document.querySelector("[name='Processador']").value.trim() || null;
        const Garantia = document.querySelector("[name='Garantia']").value.trim() || null;

        // Objeto com os dados a serem enviados
        const equipamentoData = {
            nomenclatura, preco, qtd, Cor, Compatibilidade, RAM, ROM,
            Comprimento, WIFI, SO, Ethernet, Resolucao, grafico, HDMI, USB, Bluetooth,
            Processador, Garantia, categoriaId
        };

        console.log("📤 Enviando dados:", equipamentoData);

        // Envio da requisição
        try {
            const response = await fetch("http://localhost:3000/equipamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(equipamentoData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Equipamento adicionado com sucesso!");
                loadEquipamentos();
                document.getElementById("addEquipamentoForm").reset(); // Limpa o formulário
            } else {
                alert("❌ Erro ao adicionar equipamento: " + result.message);
            }
        } catch (error) {
            console.error("Erro ao enviar requisição:", error);
            alert("❌ Erro na conexão com o servidor!");
        }
    });
});


async function loadEquipamentos() {
    const response = await fetch("http://localhost:3000/equipamentos");
    const data = await response.json();
    const tableBody = document.getElementById("equipamentosTable");
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
                <br>
                <br>
                <button onclick="editarEquipamento(${equipamento.id})">Editar</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}
async function editarEquipamento(id) {
    const CategoriaId = prompt("Digite o novo ID da categoria:");

    if (!CategoriaId) {
        alert("A categoria não foi alterada.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/equipamento/categoria/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ categoriaId: CategoriaId })
        });

        const data = await response.json();

        if (data.success) {
            alert("Categoria do equipamento atualizada com sucesso!");
            loadEquipamentos(); // Recarrega a lista de equipamentos
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (error) {
        console.error("Erro ao atualizar a categoria do equipamento:", error);
        alert("Erro ao atualizar a categoria. Verifique o console para mais detalhes.");
    }
}




async function deleteEquipamento(id) {
    if (confirm("Tem certeza que deseja excluir este equipamento?")) {
        const response = await fetch(`http://localhost:3000/equipamento/${id}`, { method: "DELETE" });
        if (response.ok) {
            alert("Equipamento excluído com sucesso!");
            loadEquipamentos();
        } else {
            alert("Erro ao excluir equipamento");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarEquipamentos();
    carregarTotalVendas();
    carregarGraficoVendasTecnico();
    carregarTotalSolicitacoes();
    carregarSolicitacoes();
});

// Carregar equipamentos no select
function carregarEquipamentos() {
    fetch('http://localhost:3000/equipamentos')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("equipamentoSelect");
            data.data.forEach(equipamento => {
                let option = document.createElement("option");
                option.value = equipamento.id;
                option.textContent = equipamento.nomenclatura;
                select.appendChild(option);
            });
        });
}

// Carregar vendas por equipamento
function carregarVendasPorEquipamento() {
    const equipamentoId = document.getElementById("equipamentoSelect").value;
    if (!equipamentoId) return;

    fetch(`http://localhost:3000/equipamentos/${equipamentoId}/vendafeitas`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("vendasTableBody");
            tbody.innerHTML = "";
            data.data.forEach(venda => {
                let row = `<tr>
                    <td>${venda.id}</td>
                    <td>${venda.SOLICITADOR}</td>
                    <td>${venda.EQUIPAMENTO}</td>
                    <td>${venda.Preco}</td>
                    <td>${venda.ATENDENTE}</td>
                    <td>${venda.TECNICO}</td>
                    <td>${venda.Data}</td>
                    <td>${venda.localizacao}</td>
                    <td>${venda.DataM}</td>
                    <td>${venda.Status}</td>
                    <td>${venda.Service}</td>

                </tr>`;
                tbody.innerHTML += row;
            });
        });
}

// Carregar total de vendas feitas
function carregarTotalVendas() {
    fetch('http://localhost:3000/vendafeitas/total')
        .then(response => response.json())
        .then(data => {
            document.getElementById("totalVendas").textContent = data.data;
        });
}



// Carregar gráfico de vendas por técnico
function carregarGraficoVendasTecnico() {
    fetch('http://localhost:3000/tecnicos/total-concluido')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error("Erro ao carregar dados do gráfico:", data.message);
                return;
            }

            const labels = data.data.map(item => item.Tecnico);
            const valores = data.data.map(item => item.total);

            const canvas = document.getElementById('graficoVendasTecnico');
            if (!canvas) {
                console.error("Erro: Canvas do gráfico de vendas não encontrado!");
                return;
            }

            const ctx = canvas.getContext('2d');

            // Destroi o gráfico anterior se já existir
            if (window.myChart) {
                window.myChart.destroy();
            }

            window.myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Vendas Concluídas',
                        data: valores,
                        backgroundColor: ['blue', 'green'], // Cores diferentes para cada técnico
                        borderColor: 'black',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            console.log("🎉 Gráfico carregado com sucesso!");
        })
        .catch(error => console.error("Erro ao buscar dados do gráfico:", error));
}



// Carregar totais de solicitações
function carregarTotalSolicitacoes() {
    fetch('http://localhost:3000/solicitacoes/total')
        .then(response => response.json())
        .then(data => {
            document.getElementById("totalSolicitacoes").textContent = data.data;
        });

    fetch('http://localhost:3000/solicitacoes/pendentes/total')
        .then(response => response.json())
        .then(data => {
            document.getElementById("solicitacoesPendentes").textContent = data.data;
        });

    fetch('http://localhost:3000/solicitacoes/em-curso/total')
        .then(response => response.json())
        .then(data => {
            document.getElementById("solicitacoesEmCurso").textContent = data.data;
        });

    fetch('http://localhost:3000/solicitacoes/concluidas/total')
        .then(response => response.json())
        .then(data => {
            document.getElementById("solicitacoesConcluidas").textContent = data.data;
        });
}

/// Carregar lista de solicitações
function carregarSolicitacoes() {
    showSection('relatorio'); // Garante que a seção correta seja exibida

    fetch('http://localhost:3000/solicitacoes')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                console.error("❌ Erro ao carregar solicitações:", data.message);
                return;
            }

            const tbody = document.getElementById("solicitacoesTableBody2");
            if (!tbody) {
                console.error("❌ Erro: Elemento 'solicitacoesTableBody2' não encontrado no DOM.");
                return;
            }

            tbody.innerHTML = ""; // Limpa a tabela antes de preencher

            if (data.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9">Nenhuma solicitação encontrada.</td></tr>`;
                return;
            }

            data.data.forEach(solicitacao => {
                let row = `<tr>
                    <td>${solicitacao.id}</td>
                    <td>${solicitacao.SOLICITADOR}</td>
                    <td>${solicitacao.Email}</td>
                    <td>${solicitacao.EQUIPAMENTO}</td>
                    <td>${solicitacao.preco ? solicitacao.preco : "N/A"}</td>
                    <td>${solicitacao.Service}</td>
                    <td>${solicitacao.Status}</td>
                    <td>${new Date(solicitacao.Data).toLocaleDateString()}</td>
                    <td>${solicitacao.localizacao}</td>
                </tr>`;
                tbody.innerHTML += row;
            });

            console.log("✅ Solicitações carregadas com sucesso!");
        })
        .catch(error => console.error("❌ Erro ao buscar solicitações:", error));
}

document.addEventListener("DOMContentLoaded", function () {
    carregarSolicitacoes();
});



async function carregarCategorias() {
    try {
        const response = await fetch('http://localhost:3000/categorias');

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Resposta da API:", responseData); // Log para depuração

        const tabela = document.getElementById('categoriasLista');
        tabela.innerHTML = '';

        if (Array.isArray(responseData.data)) { // <- Agora acessando responseData.data
            responseData.data.forEach(categoria => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${categoria.id}</td>
                    <td><input type="text" value="${categoria.nome}" id="nome-${categoria.id}"></td>
                    <td>
                        <button onclick="atualizarCategoria(${categoria.id})">Atualizar</button>
                        <button onclick="removerCategoria(${categoria.id})">Remover</button>
                        <button onclick="verEquipamentos(${categoria.id})">Ver Equipamentos</button>
                    </td>
                `;
                tabela.appendChild(linha);
            });
        } else {
            console.error("Formato inesperado da resposta da API:", responseData);
        }
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
});

document.addEventListener("DOMContentLoaded", () => {
    carregarCategoria();
});
// Função para carregar as categorias no dropdown
function carregarCategoria() {
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


async function adicionarCategoria() {
    const nome = document.getElementById('categoriaNome').value;
    await fetch('http://localhost:3000/categoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
    });
    carregarCategorias();
}

async function atualizarCategoria(id) {
    const nome = document.getElementById(`nome-\${id}`).value;
    await fetch(`http://localhost:3000/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
    });
    carregarCategorias();
}

async function removerCategoria(id) {
    await fetch(`http://localhost:3000/categoria/${id}`, { method: 'DELETE' });
    carregarCategorias();
}

async function verEquipamentos(id) {
    const response = await fetch(`http://localhost:3000/categorias/${id}/equipamentos`);
    const data = await response.json();

    if (!data.success) {
        console.error('Erro ao carregar equipamentos:', data.message);
        return;
    }

    const divEquipamentos = document.getElementById('equipamentoss');
    divEquipamentos.innerHTML = '<h3>Equipamentos:</h3>';
    data.data.forEach(equipamento => {
        divEquipamentos.innerHTML += `<p>${equipamento.nomenclatura}</p>`;
    });
}


carregarCategorias();
document.addEventListener("DOMContentLoaded", () => {
    
    const atendentesTable = document.getElementById("atendentesTable");
    const addAtendenteForm = document.getElementById("addAtendenteForm");
    
    function fetchAtendentes() {
        fetch("http://localhost:3000/atendentes")
            .then(response => response.json())
            .then(data => {
                atendentesTable.innerHTML = "";
                data.data.forEach(atendente => {
                    atendentesTable.innerHTML += `
                        <tr>
                            <td>${atendente.id}</td>
                            <td>${atendente.nome}</td>
                            <td>${atendente.email}</td>
                            <td>${atendente.contacto}</td>
                            <td>
                                <button onclick="deleteAtendente(${atendente.id})">Remover</button>
                            </td>
                        </tr>`;
                });
            });
    }
   
    
    window.deleteAtendente = (id) => {
        fetch(`http://localhost:3000/atendente/${id}`, { method: "DELETE" })
            .then(() => fetchAtendentes());
    };
    
    fetchAtendentes();
});
document.getElementById("addAtendenteForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o reload da página
    cadastrarAtendente();
});

function cadastrarAtendente() {
    const nome = document.getElementById("nomeAtendente")?.value.trim();
    const email = document.getElementById("emailAtendente")?.value.trim();
    const contacto = document.getElementById("contactoAtendente")?.value.trim();

    console.log("Nome capturado:", nome);
    console.log("Email capturado:", email);
    console.log("Contacto capturado:", contacto);

    // Validação dos campos obrigatórios
    if (!nome || !email) {
        alert("Nome e email são obrigatórios!");
        return;
    }

    fetch("http://localhost:3000/atendente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, contacto })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do backend:", data);
        if (data.success) {
            alert("Atendente cadastrado com sucesso!");
            document.getElementById("addAtendenteForm").reset();
            fetchAtendentes(); // Atualiza a lista de atendentes
        } else {
            alert("Erro: " + data.message);
        }
    })
    .catch(error => console.error("Erro na requisição:", error));
}

document.addEventListener("DOMContentLoaded", function () {
    const tecnicoForm = document.getElementById("tecnico-form");
    const tecnicosTable = document.querySelector("#tecnicos-table tbody");
    const vendasTable = document.querySelector("#vendas-table tbody");

    // Carregar técnicos ao iniciar
    function carregarTecnicos() {
        fetch("http://localhost:3000/tecnicos")
            .then(res => res.json())
            .then(data => {
                tecnicosTable.innerHTML = "";
                data.data.forEach(tecnico => {
                    const row = `<tr>
                        <td>${tecnico.nome}</td>
                        <td>${tecnico.email}</td>
                        <td>${tecnico.contacto}</td>
                        <td>
                            <button onclick="editarTecnico(${tecnico.id}, '${tecnico.nome}', '${tecnico.email}', '${tecnico.contacto}')">Editar</button>
                            <button onclick="deletarTecnico(${tecnico.id})">Excluir</button>
                            <button onclick="carregarVendas(${tecnico.id})">Ver Vendas</button>
                        </td>
                    </tr>`;
                    tecnicosTable.innerHTML += row;
                });
            })
            .catch(error => console.error("Erro ao carregar técnicos:", error));
    }

    // Cadastrar técnico
    async function cadastrarTecnico(nome, email, contacto) {
        try {
            const response = await fetch("http://localhost:3000/tecnico", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, contacto })
            });

            if (!response.ok) throw new Error("Erro ao cadastrar técnico.");
            alert("Técnico cadastrado com sucesso!");
            tecnicoForm.reset();
            carregarTecnicos();
        } catch (error) {
            console.error("Erro ao cadastrar técnico:", error);
            alert("Erro ao cadastrar técnico. Verifique os dados e tente novamente.");
        }
        carregarTecnicos();
    }

    // Atualizar técnico
    async function atualizarTecnico(id, nome, email, contacto) {
        try {
            const response = await fetch(`http://localhost:3000/tecnico/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, contacto })
            });

            if (!response.ok) throw new Error("Erro ao atualizar técnico.");
            alert("Técnico atualizado com sucesso!");
            tecnicoForm.reset();
            document.getElementById("tecnico-id").value = ""; // Limpa o ID após a atualização
            carregarTecnicos();
        } catch (error) {
            console.error("Erro ao atualizar técnico:", error);
            alert("Erro ao atualizar técnico. Verifique os dados e tente novamente.");
        }
    }

    // Editar técnico (preencher o formulário com os dados)
    window.editarTecnico = function (id, nome, email, contacto) {
        document.getElementById("tecnico-id").value = id;
        document.getElementById("nome").value = nome;
        document.getElementById("email").value = email;
        document.getElementById("contacto").value = contacto;
    };

    // Excluir técnico
    window.deletarTecnico = function (id) {
        if (confirm("Tem certeza que deseja excluir este técnico?")) {
            fetch(`http://localhost:3000/tecnico/${id}`, { method: "DELETE" })
                .then(res => res.json())
                .then(() => {
                    alert("Técnico excluído com sucesso!");
                    carregarTecnicos();
                })
                .catch(error => {
                    console.error("Erro ao excluir técnico:", error);
                    alert("Erro ao excluir técnico.");
                });
        }
    };

    // Carregar vendas associadas ao técnico
    window.carregarVendas = function (tecnicoId) {
        if (!vendasTable) {
            console.error("Tabela de vendas não encontrada.");
            return;
        }

        fetch(`http://localhost:3000/tecnicos/${tecnicoId}/vendafeitas`)
            .then(res => res.json())
            .then(data => {
                vendasTable.innerHTML = "";
                data.data.forEach(venda => {
                    const row = `<tr>
                        <td>${venda.SOLICITADOR}</td>
                        <td>${venda.EQUIPAMENTO}</td>
                        <td>${venda.ATENDENTE}</td>
                        <td>${venda.TECNICO}</td>
                        <td>${venda.Data}</td>
                        <td>${venda.localizacao}</td>
                        <td>${venda.DataM}</td>
                    </tr>`;
                    vendasTable.innerHTML += row;
                });
            })
            .catch(error => console.error("Erro ao carregar vendas:", error));
    };

    // Manipular envio do formulário
    tecnicoForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const id = document.getElementById("tecnico-id").value;
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const contacto = document.getElementById("contacto").value;

        if (id) {
            atualizarTecnico(id, nome, email, contacto);
        } else {
            cadastrarTecnico(nome, email, contacto);
        }
    });

    carregarTecnicos(); // Carregar técnicos ao iniciar a página
});


document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
});

function showSection(section) {
    document.querySelectorAll(".content").forEach(div => div.style.display = "none");
    document.getElementById(section).style.display = "block";
    document.querySelectorAll(".menu a").forEach(link => link.classList.remove("active"));
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add("active");
}

async function carregarClientes() {
    try {
        const response = await fetch("http://localhost:3000/clientes");
        const data = await response.json();
        if (data.success) {
            const tableBody = document.querySelector("#clientes-table tbody");
            tableBody.innerHTML = "";
            data.data.forEach(cliente => {
                const row = `
                    <tr>
                        <td>${cliente.nome}</td>
                        <td>${cliente.email}</td>
                        <td>${cliente.contacto}</td>
                        <td>
                            <button onclick="carregarSolicitacoes(${cliente.id})">Ver Solicitações</button>
                            <br>
                            <br>
                            <button onclick="carregarVendas(${cliente.id})">Ver Vendas</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    }
    document.addEventListener("DOMContentLoaded", function () {
        carregarSolicitacoes(clienteId); 
    });
}


async function carregarSolicitacoes(clienteId) {
    try {
        const response = await fetch(`http://localhost:3000/clientes/${clienteId}/solicitacoes`);
        const data = await response.json();

        const tableBody = document.querySelector("#solicitacoes-table tbody");

        // Verifica se a tabela existe antes de tentar modificar
        if (!tableBody) {
            console.error("Erro: Elemento #solicitacoes-table tbody não encontrado.");
            return;
        }

        if (data.success) {
            tableBody.innerHTML = "";
            data.data.forEach(solicitacao => {
                const row = `
                    <tr>
                        <td>${solicitacao.Localizacao}</td>
                        <td>${solicitacao.SOLICITADOR}</td>
                        <td>${solicitacao.EQUIPAMENTO}</td>
                        <td>${solicitacao.PRECO}</td>
                        <td>${solicitacao.Status}</td>
                        <td>${solicitacao.Data}</td>
                        <td>${solicitacao.DataM}</td>
                        <td>${solicitacao.Service}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } else {
            console.error("Erro ao carregar solicitações: ", data.message);
        }
    } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
    }
}



async function carregarVendas(clienteId) {
    try {
        const response = await fetch(`http://localhost:3000/clientes/${clienteId}/vendafeitas`);
        const data = await response.json();
        if (data.success) {
            const tableBody = document.querySelector("#vendas-table tbody");
            tableBody.innerHTML = "";
            data.data.forEach(venda => {
                const row = `
                    <tr>
                        <td>${venda.SOLICITADOR}</td>
                        <td>${venda.EQUIPAMENTO}</td>
                        <td>${venda.PRECO}</td>
                        <td>${venda.ATENDENTE}</td>
                        <td>${venda.TECNICO}</td>
                        <td>${venda.Data}</td>
                        <td>${venda.Localizacao}</td>
                        <td>${venda.DataM}</td>
                        <td>${venda.Status}</td>
                        <td>${venda.Service}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error("Erro ao carregar vendas:", error);
    }
}
document.querySelector(".logout").addEventListener("click", function() {
    // Redireciona para a tela de login
    window.location.href = "login.html";
});
  