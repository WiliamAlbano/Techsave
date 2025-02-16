//function to validate a email address(name@gmail.com)
function validateEmail(email) {
    let regex = /^[^\s@]+@gmail\.com$/;
    return regex.test(email);
}
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".signup-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Capturar os valores dos campos do formulário
        const email = form.querySelector('input[type="email"]').value;
        const nome = form.querySelector('input[placeholder="Nome completo"]').value;
        const contacto = form.querySelector('input[placeholder="Contacto"]').value;

        validateEmail(email);

        // Criar o objeto com os dados do formulário
        const clienteData = {
            nome: nome,
            email: email,
            contacto: contacto
        };

        try {
            // Enviar os dados para o servidor
            const response = await fetch("http://localhost:3000/admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(clienteData)
            });

            // Converter a resposta em JSON
            const result = await response.json();

            if (result.success) {
                alert("Conta criada com sucesso!");
                window.location.href = "../html/Login.html"; // Redireciona para a página de login
            } else {
                alert("Erro ao criar conta: " + result.message);
            }
        } catch (error) {
            console.error("Erro ao enviar dados:", error);
            alert("Erro ao conectar ao servidor.");
        }
    });
});
