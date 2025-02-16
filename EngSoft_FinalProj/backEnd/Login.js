//function to validate a email address(name@gmail.com)
function validateEmail(email) {
    let regex = /^[^\s@]+@gmail\.com$/;
    return regex.test(email);
}

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita que a página recarregue

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    validateEmail(email);

    login(email, password);
});
//function for logging
async function login(email, password) {
    
    const userTypes = ["cliente", "atendente", "tecnico", "admin"];
    
    for (let type of userTypes) {
        try {
            let response = await fetch(`http://localhost:3000/${type}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            let data = await response.json();
            


            if (response.ok) {
                console.log("ID recebido:", data[`${type}Id`]); 
                localStorage.setItem("userId", data[`${type}Id`]); 
                localStorage.setItem("userType", type);
                switch (data.message) {
                    
                    case "Cliente":
                        window.location.href = "cliente.html";
                        return;
                    case "Atendente":
                        window.location.href = "atendente.html";
                        return;
                    case "Tecnico":
                        window.location.href = "tecnico.html";
                        return;
                    case "Admin":
                        window.location.href = "admin.html";
                        return;
                }
            }
        } catch (error) {
            console.error(`Erro ao tentar login como ${type}:`, error);
        }
    }
    
    alert("Falha na autenticação. Verifique suas credenciais.");
}
