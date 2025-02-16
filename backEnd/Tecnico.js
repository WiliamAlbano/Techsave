const userId = localStorage.getItem("userId");
const userType = localStorage.getItem("userType");

console.log("ID do usuário:", userId);
console.log("Tipo de usuário:", userType);

if (!userId || !userType) {
    alert("Erro: Usuário não autenticado. Faça login novamente.");
    window.location.href = "login.html";
}
function carregarVendasFeitas() {
    fetch(`http://localhost:3000/tecnicos/${userId}/vendafeitas/em-curso`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tabela = document.getElementById("vendas-tabela");
                tabela.innerHTML = ""; // Limpa a tabela antes de popular

                data.data.forEach(venda => {
                    const linha = `
                        <tr>
                            <td>${venda.SOLICITADOR}</td>
                            <td>${venda.Email}</td>
                            <td>${venda.EQUIPAMENTO}</td>
                            <td>${venda.Preco} Kz</td>
                            <td>${venda.ATENDENTE}</td>
                            <td>${venda.Data}</td>
                            <td>${venda.localizacao}</td>
                            <td>${venda.DataM}</td>
                            <td class="status">${venda.Status}</td>
                            <td>
                                <button class="accept-btn" onclick="concluirVenda(${venda.id},'${venda.Email}')">Feito</button>
                            </td>
                        </tr>
                    `;
                    tabela.innerHTML += linha;
                });
            } else {
                alert("Erro ao carregar vendas feitas!");
            }
        })
        .catch(error => console.error("Erro ao carregar vendas:", error));
}

// Concluir venda feita
function concluirVenda(vendaId,email) {
    fetch(`http://localhost:3000/vendafeitas/${vendaId}/concluir`, { method: 'PUT' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Atualizar também o status na tabela solicitacao
                fetch(`http://localhost:3000/solicitacao/concluida/${vendaId}`, { method: 'PUT' })
                    .then(response => response.json())
                    .then(() => {
                        // Gerar PDF com as informações da venda feita
                        fetch(`http://localhost:3000/gerar-pdf/${vendaId}`)
                            .then(response => response.json())
                            .then(pdfData => {
                                if (pdfData.success) {
                                    // Enviar e-mail ao cliente com o PDF anexado
                                    fetch(`http://localhost:3000/enviarEmail`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            email: email,
                                            assunto: "Obrigado por escolher a TechSave!",
                                            mensagem: "Sua solicitação foi concluída com sucesso. Em anexo, o documento da sua compra.",
                                            pdfPath: pdfData.pdfPath // Caminho do PDF gerado
                                        })
                                    }).then(() => {
                                        alert("Venda concluída com sucesso e e-mail enviado ao cliente!");
                                        carregarSolicitacoes(); // Atualiza a tela
                                    });
                                }
                            });
                    });
            }
        })
        .catch(error => console.error("Erro ao concluir venda:", error));
}
// Logout
function logout() {
    window.location.href = "login.html";
}