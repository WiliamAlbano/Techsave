const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors= require('cors');
const app = express();
const enviarEmail = require('./emailService');
const axios = require("axios");
const PDFDocument = require('pdfkit');
const fs = require('fs');


//cors
app.use(cors({ origin: '*' }));

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'PequenoAstro3!',
    database: 'TMEDB'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database!');
});

//Endpoint for the emailService
app.post('/enviarEmail', async (req, res) => {
  const { email, assunto, mensagem, anexo } = req.body;  

  try {
      const resposta = await enviarEmail(email, assunto, mensagem, anexo);
      res.json({ success: true, message: 'E-mail enviado com sucesso!', resposta });
  } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      res.status(500).json({ success: false, message: 'Erro ao enviar e-mail', error });
  }
});


  
//Endpoint for client login
  app.post('/cliente/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Email recebido:', email);
    console.log('Password recebida:', password);
    
    db.query('SELECT * FROM cliente WHERE email =? AND password =?', [email, password], (err, result) => {
      if (err) {
          console.error('Error logging in:', err);
          return res.status(401).json({ message: 'Falha na autenticação' });
      }
      
      if (result.length === 0) {
          return res.status(401).json({  message: 'Falha na autenticação' });
      }
      
      res.json({ message: 'Cliente', clienteId: result[0].id });
      
    });
  }); 
//Endpoint to add a Client
  app.post('/cliente', async (req, res) => {
    const { nome, email, contacto } = req.body;

    db.query('INSERT INTO cliente SET?', { nome, email, contacto }, async (err, result) => {
        if (err) {
            console.error('Error inserting client:', err);
            return res.status(500).json({ success: false, message: 'Error inserting client' });
        }
         // Enviar e-mail de boas-vindas
         const emailData = {
          email: email,
          assunto: "Bem-vindo ao TechSave!",
          mensagem: `Olá ${nome},\n\nSua conta Cliente foi criada com sucesso!\nSua senha inicial é: 1234\n\nPor favor, altere sua senha após o primeiro login.\n\nObrigado,\nEquipe TechSave`
      };

      try {
        // Chama o endpoint de envio de e-mail
        const respostaEmail = await axios.post("http://localhost:3000/enviarEmail", emailData);

        res.json({ 
            success: true, 
            message: "Cliente cadastrado e e-mail enviado!", 
            insertedId: result.insertId,
            emailResponse: respostaEmail.data
        });
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        res.status(500).json({ success: false, message: "Cliente criado, mas erro ao enviar e-mail" });
    }
    });
  });
  
//Endpoint to get all Clients
  app.get('/clientes', (req, res) => {
    db.query('SELECT * FROM cliente', (err, result) => {
        if (err) {
            console.error('Error retrieving clients:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving clients' });
        }

        res.json({ success: true, message: 'Clientes carregados com sucesso!', data: result });
    });
  });
  
//Endpoint to update a Client
  app.put('/cliente/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, contacto, password } = req.body;

    db.query('UPDATE cliente SET nome=?, email=?, contacto=?, password=? WHERE id=?', [nome, email, contacto, password, id], (err, result) => {
        if (err) {
            console.error('Error updating client:', err);
            return res.status(500).json({ success: false, message: 'Error updating client' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
        }

        res.json({ success: true, message: 'Cliente atualizado com sucesso!' });
    });
  });
  
//Endpoint to delete a Client
  app.delete('/cliente/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM cliente WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting client:', err);
            return res.status(500).json({ success: false, message: 'Error deleting client' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
        }

        res.json({ success: true, message: 'Cliente excluído com sucesso!' });
    });
  });

//Endpoint to update a Client password
  app.put('/cliente/password/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    db.query('UPDATE cliente SET password=? WHERE id=?', [password, id], (err, result) => {
        if (err) {
            console.error('Error updating client password:', err);
            return res.status(500).json({ success: false, message: 'Error updating client password' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
        }

        res.json({ success: true, message: 'Senha do cliente atualizada com sucesso!' });
    });
  });

  
// Endpoint for atendente login
  app.post('/atendente/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Email recebido:', email);
    console.log('Password recebida:', password);
    
    db.query('SELECT * FROM atendente WHERE email =? AND password =?', [email, password], (err, result) => {
      if (err) {
          console.error('Error logging in:', err);
          return res.status(401).json({ message: 'Falha na autenticação' });
      }
      
      if (result.length === 0) {
          return res.status(401).json({  message: 'Falha na autenticação' });
      }
      
      res.json({ message: 'Atendente', atendenteId: result[0].id });
    });
  });

  
// Endpoint to add an Atendente
  app.post('/atendente', async (req, res) => {
    const { nome, email, contacto } = req.body;
    console.log(req.body);

     // Verifica se email e nome foram preenchidos
     if (!nome || !email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Nome e email são obrigatórios e o email deve ser válido!" });
  }

    db.query('INSERT INTO atendente (nome, email, Contacto) VALUES(?, ?, ?)', [ nome, email, contacto ], async (err, result) => {
        if (err) {
            console.error('Error inserting atendente:', err);
            return res.status(500).json({ success: false, message: 'Error inserting atendente' });
        }
           // Enviar e-mail de boas-vindas
           const emailData = {
            email: email,
            assunto: "Bem-vindo ao TechSave!",
            mensagem: `Olá ${nome},\n\nSua conta Atendente foi criada com sucesso!\nSua senha inicial é: 1234\n\nPor favor, altere sua senha após o primeiro login.\n\nObrigado,\nEquipe TechSave`
        };
  
        try {
          // Chama o endpoint de envio de e-mail
          const respostaEmail = await axios.post("http://localhost:3000/enviarEmail", emailData);
  
          res.json({ 
              success: true, 
              message: "Atendente cadastrado e e-mail enviado!", 
              insertedId: result.insertId,
              emailResponse: respostaEmail.data
          });
      } catch (error) {
          console.error("Erro ao enviar e-mail:", error);
          res.status(500).json({ success: false, message: "Atendente criado, mas erro ao enviar e-mail" });
      }        
    });
  });
  
// Endpoint to get all Atendentes
  app.get('/atendentes', (req, res) => {
    db.query('SELECT * FROM atendente', (err, result) => {
        if (err) {
            console.error('Error retrieving atendentes:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving atendentes' });
        }

        res.json({ success: true, message: 'Atendentes carregados com sucesso!', data: result });
    });
  });
  
//Endpoint to get all Atendentes emails
  app.get('/atendentes/emails', (req, res) => {
    db.query('SELECT email FROM atendente', (err, result) => {
        if (err) {
            console.error('Error retrieving atendentes emails:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving atendentes emails' });
        }

        res.json({ success: true, message: 'Atendentes emails carregados com sucesso!', data: result });
    });
  });  
  
// Endpoint to update an Atendente
  app.put('/atendente/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, contacto, password } = req.body;
    
    db.query('UPDATE atendente SET nome=?, email=?, contacto=?, password=? WHERE id=?', [nome, email, contacto, password, id], (err, result) => {
      if (err) {
          console.error('Error updating atendente:', err);
          return res.status(500).json({ success: false, message: 'Error updating atendente' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Atendente não encontrado' });
      }
      
      res.json({ success: true, message: 'Atendente atualizado com sucesso!' });
    });
  });
  
// Endpoint to delete an Atendente
  app.delete('/atendente/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM atendente WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting atendente:', err);
            return res.status(500).json({ success: false, message: 'Error deleting atendente' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Atendente não encontrado' });
        }

        res.json({ success: true, message: 'Atendente excluído com sucesso!' });
    });
  });
  
// Endpoint to update an Atendente password
  app.put('/atendente/password/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    db.query('UPDATE atendente SET password=? WHERE id=?', [password, id], (err, result) => {
        if (err) {
            console.error('Error updating atendente password:', err);
            return res.status(500).json({ success: false, message: 'Error updating atendente password' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Atendente não encontrado' });
        }

        res.json({ success: true, message: 'Senha do atendente atualizada com sucesso!' });
    });
  });
  
 //Endpoint for Tecnico login
  app.post('/tecnico/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Email recebido:', email);
    console.log('Password recebida:', password);
    
    db.query('SELECT * FROM tecnico WHERE email =? AND password =?', [email, password], (err, result) => {
      if (err) {
          console.error('Error logging in:', err);
          return res.status(401).json({ message: 'Falha na autenticação' });
      }
      
      if (result.length === 0) {
          return res.status(401).json({  message: 'Falha na autenticação' });
      }
      
      res.json({ message: 'Tecnico', tecnicoId: result[0].id });
    });
  });

// Endpoint to add a Tecnico
  app.post('/tecnico', async (req, res) => {
    const { nome, email, contacto } = req.body;

    db.query('INSERT INTO tecnico SET?', { nome, email, contacto }, async (err, result) => {
        if (err) {
            console.error('Error inserting tecnico:', err);
            return res.status(500).json({ success: false, message: 'Error inserting tecnico' });
        }

           // Enviar e-mail de boas-vindas
           const emailData = {
            email: email,
            assunto: "Bem-vindo ao TechSave!",
            mensagem: `Olá ${nome},\n\nSua conta Técnico foi criada com sucesso!\nSua senha inicial é: 1234\n\nPor favor, altere sua senha após o primeiro login.\n\nObrigado,\nEquipe TechSave`
        };
  
        try {
          // Chama o endpoint de envio de e-mail
          const respostaEmail = await axios.post("http://localhost:3000/enviarEmail", emailData);
  
          res.json({ 
              success: true, 
              message: "Técnico cadastrado e e-mail enviado!", 
              insertedId: result.insertId,
              emailResponse: respostaEmail.data
          });
      } catch (error) {
          console.error("Erro ao enviar e-mail:", error);
          res.status(500).json({ success: false, message: "Técnico criado, mas erro ao enviar e-mail" });
      }
    });
  });
  
// Endpoint to get all Tecnicos
  app.get('/tecnicos', (req, res) => {
    db.query('SELECT * FROM tecnico', (err, result) => {
        if (err) {
            console.error('Error retrieving tecnicos:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving tecnicos' });
        }

        res.json({ success: true, message: 'Tecnicos carregados com sucesso!', data: result });
    });
  });
  
// Endpoint to update a Tecnico
  app.put('/tecnico/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, contacto, password } = req.body;
    
    db.query('UPDATE tecnico SET nome=?, email=?, contacto=?, password=? WHERE id=?', [nome, email, contacto, password, id], (err, result) => {
      if (err) {
          console.error('Error updating tecnico:', err);
          return res.status(500).json({ success: false, message: 'Error updating tecnico' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Tecnico não encontrado' });
      }
      
      res.json({ success: true, message: 'Tecnico atualizado com sucesso!' });
    });
  });
  
// Endpoint to delete a Tecnico
  app.delete('/tecnico/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tecnico WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting tecnico:', err);
            return res.status(500).json({ success: false, message: 'Error deleting tecnico' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tecnico não encontrado' });
        }

        res.json({ success: true, message: 'Tecnico excluído com sucesso!' });
    });
  });
  
// Endpoint to update a Tecnico password
  app.put('/tecnico/password/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    db.query('UPDATE tecnico SET password=? WHERE id=?', [password, id], (err, result) => {
        if (err) {
            console.error('Error updating tecnico password:', err);
            return res.status(500).json({ success: false, message: 'Error updating tecnico password' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tecnico não encontrado' });
        }

        res.json({ success: true, message: 'Senha do tecnico atualizada com sucesso!' });
    });
  });

//Endpoint for admin login
  app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Email recebido:', email);
    console.log('Password recebida:', password);
    
    db.query('SELECT * FROM admin WHERE email =? AND password =?', [email, password], (err, result) => {
      if (err) {
          console.error('Error logging in:', err);
          return res.status(401).json({ message: 'Falha na autenticação' });
      }
      
      if (result.length === 0) {
          return res.status(401).json({  message: 'Falha na autenticação' });
      }
      
      res.json({ message: 'Admin', adminId: result[0].id });
    });
  });

// Endpoint to add an Admin
  app.post('/admin', async (req, res) => {
    const { nome, email, contacto } = req.body;

    db.query('INSERT INTO admin SET?', { nome, email, contacto }, async (err, result) => {
        if (err) {
            console.error('Error inserting admin:', err);
            return res.status(500).json({ success: false, message: 'Error inserting admin' });
        }

        // Enviar e-mail de boas-vindas
        const emailData = {
            email: email,
            assunto: "Bem-vindo ao TechSave!",
            mensagem: `Olá ${nome},\n\nSua conta Administrador foi criada com sucesso!\nSua senha inicial é: 1234\n\nPor favor, altere sua senha após o primeiro login.\n\nObrigado,\nEquipe TechSave`
        };
        
        try {
          // Chama o endpoint de envio de e-mail
          const respostaEmail = await axios.post("http://localhost:3000/enviarEmail", emailData);
          
          res.json({
            success: true,
            message: "Admin cadastrado e e-mail enviado!",
            insertedId: result.insertId,
            emailResponse: respostaEmail.data
          });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            res.status(500).json({ success: false, message: "Técnico criado, mas erro ao enviar e-mail" });
        }
    });
  });
  
// Endpoint to get all Admins
  app.get('/admins', (req, res) => {
    db.query('SELECT * FROM admin', (err, result) => {
        if (err) {
            console.error('Error retrieving admins:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving admins' });
        }

        res.json({ success: true, message: 'Admins carregados com sucesso!', data: result });
    });
  });
  
// Endpoint to update an Admin
  app.put('/admin/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, contacto, password } = req.body;
    
    db.query('UPDATE admin SET nome=?, email=?, contacto=?, password=? WHERE id=?', [nome, email, contacto, password, id], (err, result) => {
      if (err) {
          console.error('Error updating admin:', err);
          return res.status(500).json({ success: false, message: 'Error updating admin' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Admin não encontrado' });
      }
      
      res.json({ success: true, message: 'Admin atualizado com sucesso!' });
    });
  });
  
// Endpoint to delete an Admin
  app.delete('/admin/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM admin WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting admin:', err);
            return res.status(500).json({ success: false, message: 'Error deleting admin' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Admin não encontrado' });
        }

        res.json({ success: true, message: 'Admin excluído com sucesso!' });
    });
  });
  
// Endpoint to update an Admin password
  app.put('/admin/password/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    db.query('UPDATE admin SET password=? WHERE id=?', [password, id], (err, result) => {
        if (err) {
            console.error('Error updating admin password:', err);
            return res.status(500).json({ success: false, message: 'Error updating admin password' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Admin não encontrado' });
        }

        res.json({ success: true, message: 'Senha do admin atualizada com sucesso!' });
    });
  });

//Endpoint to add a categoria
  app.post('/categoria', (req, res) => {
    const { nome } = req.body;

    db.query('INSERT INTO categoria SET?', { nome }, (err, result) => {
        if (err) {
            console.error('Error inserting categoria:', err);
            return res.status(500).json({ success: false, message: 'Error inserting categoria' });
        }

        res.json({ success: true, message: 'Categoria inserida com sucesso!', insertedId: result.insertId });
    });
  });
  

  
// Endpoint to update a categoria
  app.put('/categorias/:id', (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    
    db.query('UPDATE categoria SET nome=? WHERE id=?', [nome, id], (err, result) => {
      if (err) {
          console.error('Error updating categoria:', err);
          return res.status(500).json({ success: false, message: 'Error updating categoria' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Categoria não encontrada' });
      }
      
      res.json({ success: true, message: 'Categoria atualizada com sucesso!' });
    });
  });
  
// Endpoint to get all categorias
  app.get('/categorias', (req, res) => {
    db.query('SELECT * FROM categoria', (err, result) => {
        if (err) {
            console.error('Error retrieving categorias:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving categorias' });
        }

        res.json({ success: true, message: 'Categorias carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to delete a categoria
  app.delete('/categoria/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM categoria WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting categoria:', err);
            return res.status(500).json({ success: false, message: 'Error deleting categoria' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Categoria não encontrada' });
        }

        res.json({ success: true, message: 'Categoria excluída com sucesso!' });
    });
  });
  
// Endpoint to add a equipamento
app.post('/equipamento', (req, res) => {
  let { nomenclatura, preco, qtd, Cor, Compatibilidade, RAM, ROM, Comprimento, WIFI, Ethernet, SO, Resolucao, grafico, HDMI, USB, Bluetooth, Processador, garantia, categoriaId } = req.body;

  // Convertendo valores vazios para NULL ou valores padrão
  preco = preco ? parseFloat(preco) : null;
  qtd = qtd ? parseInt(qtd) : 0;
  Comprimento = Comprimento ? parseFloat(Comprimento) : null;

  const sql = `INSERT INTO equipamento 
      (nomenclatura, preco, qtd, Cor, Compatibilidade, RAM, ROM, Comprimento, WIFI, Ethernet, SO, Resolucao, grafico, HDMI, USB, Bluetooth, Processador, garantia, categoriaId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [nomenclatura, preco, qtd, Cor, Compatibilidade, RAM || null, ROM || null, Comprimento, WIFI, Ethernet, SO || null, Resolucao, grafico || null, HDMI, USB, Bluetooth, Processador || null, garantia, categoriaId || null], (err, result) => {
      if (err) {
          console.error('Erro ao inserir equipamento:', err);
          return res.status(500).json({ success: false, message: 'Erro ao inserir equipamento' });
      }
      res.json({ success: true, message: 'Equipamento inserido com sucesso!', equipamentoId: result.insertId });
  });
});

  
// Endpoint to get all equipamentos
  app.get('/equipamentos', (req, res) => {
    db.query('SELECT * FROM equipamento', (err, result) => {
        if (err) {
            console.error('Error retrieving equipamentos:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving equipamentos' });
        }

        res.json({ success: true, message: 'Equipamentos carregados com sucesso!', data: result });
    });
  });
  
// Endpoint to get equipamentos by category
  app.get('/categorias/:id/equipamentos', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM equipamento WHERE categoriaId=?', [id], (err, result) => {
        if (err) {
            console.error('Error retrieving equipamentos by category:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving equipamentos by category' });
        }

        res.json({ success: true, message: 'Equipamentos carregados com sucesso!', data: result });
    });
  });
  
// Endpoint to get one equipamento by id
  app.get('/equipamento/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM equipamento WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error retrieving equipamento by id:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving equipamento by id' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Equipamento não encontrado' });
        }

        res.json({ success: true, message: 'Equipamento carregado com sucesso!', data: result[0] });
    });
  });
  
// Endpoint to update an equipamento qtd
  app.put('/equipamento/qtd/:id', (req, res) => {
    const { id } = req.params;
    const { qtd } = req.body;
    
    db.query('UPDATE equipamento SET qtd=? WHERE id=?', [qtd, id], (err, result) => {
      if (err) {
          console.error('Error updating equipamento qtd:', err);
          return res.status(500).json({ success: false, message: 'Error updating equipamento qtd' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Equipamento não encontrado' });
      }
      
      res.json({ success: true, message: 'Quantidade de equipamento atualizada com sucesso!' });
    });
  });
  
// Endpoint to reduce equipamento by one
  app.put('/equipamento/reducao/:id', (req, res) => {
    const { id } = req.params;

    db.query('UPDATE equipamento SET qtd=qtd-1 WHERE id=?', [id], (err, result) => {
      if (err) {
          console.error('Error reducing equipamento by one:', err);
          return res.status(500).json({ success: false, message: 'Error reducing equipamento by one' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Equipamento não encontrado' });
      }
      
      res.json({ success: true, message: 'Quantidade de equipamento reduzida com sucesso!' });
    });
  });
  
// Endpoint to update an equipamento categoriaId
  app.put('/equipamento/categoria/:id', (req, res) => {
    const { id } = req.params;
    const { categoriaId } = req.body;
    
    db.query('UPDATE equipamento SET categoriaId=? WHERE id=?', [categoriaId, id], (err, result) => {
      if (err) {
          console.error('Error updating equipamento categoriaId:', err);
          return res.status(500).json({ success: false, message: 'Error updating equipamento categoriaId' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Equipamento não encontrado' });
      }
      
      res.json({ success: true, message: 'Categoria do equipamento atualizada com sucesso!' });
    });
  });
  
// Endpoint to delete an equipamento
  app.delete('/equipamento/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM equipamento WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting equipamento:', err);
            return res.status(500).json({ success: false, message: 'Error deleting equipamento' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Equipamento não encontrado' });
        }

        res.json({ success: true, message: 'Equipamento excluído com sucesso!' });
    });
  });

  
// Endpoint to get all equipamentos by preço
  app.get('/preco', (req, res) => {
    const { min, max } = req.query;

    db.query('SELECT * FROM equipamento WHERE preco BETWEEN? AND?', [min, max], (err, result) => {
        if (err) {
            console.error('Error retrieving equipamentos by preço:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving equipamentos by preço' });
        }

        res.json({ success: true, message: 'Equipamentos carregados com sucesso!', data: result });
    });
  });
  
// Endpoint to add a solicitação
  app.post('/solicitacao', (req, res) => {
    const { ClienteId, EquipamentId,  Data, Localizacao, DataM} = req.body;
    
    db.query('INSERT INTO solicitacao SET?', { ClienteId, EquipamentId, Data, Localizacao, DataM }, (err, result) => {
      if (err) {
          console.error('Error inserting solicitacao:', err);
          return res.status(500).json({ success: false, message: 'Error inserting solicitacao' });
      }
      
     // Buscar e-mails dos atendentes
     db.query('SELECT email FROM atendente', async (err, atendentes) => {
      if (err) {
          console.error('Erro ao buscar e-mails dos atendentes:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar e-mails dos atendentes' });
      }

      if (atendentes.length === 0) {
          return res.status(404).json({ success: false, message: 'Nenhum atendente encontrado' });
      }

      // Enviar e-mails para todos os atendentes
      const mensagens = atendentes.map(({ email }) => {
          return enviarEmail(email, 'Nova Solicitação de Equipamento',
              `O cliente ID: ${ClienteId} solicitou o equipamento ID: ${EquipamentId} para ${DataM}, localizado em ${Localizacao}.`);
      });

      try {
          await Promise.all(mensagens);
          res.json({ success: true, message: 'Solicitação registrada e e-mails enviados aos atendentes' });
      } catch (error) {
          console.error('Erro ao enviar e-mails:', error);
          res.status(500).json({ success: false, message: 'Solicitação registrada, mas erro ao enviar e-mails' });
      }
  });
}
);
});
  
// Endpoint to get all solicitacoes
  app.get('/solicitacoes', (req, res) => {
     const query =`SELECT 
     solicitacao.id,
     solicitacao.localizacao,
     cliente.nome as SOLICITADOR,
     cliente.email as Email,
     cliente.id as clienteId,
     equipamento.nomenclatura as EQUIPAMENTO,
     equipamento.preco,
     equipamento.id as equipamentoId,
     solicitacao.Service,
     solicitacao.Status,
     solicitacao.Data,
     solicitacao.DataM
     FROM solicitacao
     JOIN 
        cliente ON solicitacao.ClienteId = cliente.id
     JOIN 
        equipamento ON solicitacao.EquipamentId = equipamento.id
     `;
    db.query(query , (err, result) => {
        if (err) {
            console.error('Error retrieving solicitacoes:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving solicitacoes' });
        }

        res.json({ success: true, message: 'Solicitacoes carregadas com sucesso!', data: result });
    });
  });

// Endpoint to update a solicitacao status(change the status to rejeitada)
  app.put('/solicitacao/rejeitar/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('UPDATE solicitacao SET Status="Rejeitada" WHERE id=?', [id], (err, result) => {
      if (err) {
          console.error('Error updating solicitacao status:', err);
          return res.status(500).json({ success: false, message: 'Error updating solicitacao status' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Solicitacao não encontrada' });
      }
      
      res.json({ success: true, message: 'Status da solicitacao atualizado com sucesso!' });
    });
  });
  // Endpoint to update a solicitacao status(change the status to em curso)
  app.put('/solicitacao/emCurso/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('UPDATE solicitacao SET Status="Em curso" WHERE id=?', [id], (err, result) => {
      if (err) {
          console.error('Error updating solicitacao status:', err);
          return res.status(500).json({ success: false, message: 'Error updating solicitacao status' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Solicitacao não encontrada' });
      }
      
      res.json({ success: true, message: 'Status da solicitacao atualizado com sucesso!' });
    });
  });

  // Endpoint to update a solicitacao status(change the status to concluida)
  app.put('/solicitacao/concluida/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('UPDATE solicitacao SET Status="Concluida" WHERE id=?', [id], (err, result) => {
      if (err) {
          console.error('Error updating solicitacao status:', err);
          return res.status(500).json({ success: false, message: 'Error updating solicitacao status' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Solicitacao não encontrada' });
      }
      
      res.json({ success: true, message: 'Status da solicitacao atualizado com sucesso!' });
    });
  });
  
// Endpoint to get all solicitacoes with the status 'pendente'
  app.get('/solicitacoes/pendentes', (req, res) => {
     const query = `SELECT 
       solicitacao.id, 
       solicitacao.localizacao, 
       cliente.nome as SOLICITADOR,
       equipamento.nomenclatura as EQUIPAMENTO, 
       solicitacao.Status, 
       solicitacao.Data, 
       solicitacao.DataM
     FROM solicitacao
     JOIN 
       cliente ON solicitacao.ClienteId = cliente.id
      JOIN
       equipamento ON solicitacao.EquipamentId = equipamento.id 
     WHERE solicitacao.Status='Pendente'`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error retrieving solicitacoes pendentes:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving solicitacoes pendentes' });
        }

        res.json({ success: true, message: 'Solicitacoes pendentes carregadas com sucesso!', data: result });
    });
  });

// Endpoint to get all solicitacoes with the status 'rejeitada'
  app.get('/solicitacoes/rejeitadas', (req, res) => {
    const query =`SELECT 
    solicitacao.id, 
    solicitacao.localizacao, 
    cliente.nome as SOLICITADOR,
    equipamento.nomenclatura as EQUIPAMENTO, 
    solicitacao.Status,
    solicitacao.Data, 
    solicitacao.DataM
    FROM solicitacao
    JOIN
     cliente ON solicitacao.ClienteId = cliente.id
    JOIN
     equipamento ON solicitacao.EquipamentId = equipamento.id
     WHERE solicitacao.Status='rejeitada'`;
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error retrieving solicitacoes rejeitadas:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving solicitacoes rejeitadas' });
        }

        res.json({ success: true, message: 'Solicitacoes rejeitadas carregadas com sucesso!', data: result });
    });
  });

// Endpoint to get all solicitacoes with the status 'Concluida'
  app.get('/solicitacoes/concluidas', (req, res) => {
    db.query('SELECT * FROM solicitacao WHERE Status="Concluida"', (err, result) => {
        if (err) {
            console.error('Error retrieving solicitacoes concluidas:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving solicitacoes concluidas' });
        }

        res.json({ success: true, message: 'Solicitacoes concluidas carregadas com sucesso!', data: result });
    });
  });

// Endpoint to get all solicitacoes with the status 'Em Curso'
  app.get('/solicitacoes/em-curso', (req, res) => {
    const query = `SELECT
    solicitacao.id, 
    solicitacao.localizacao, 
    cliente.nome as SOLICITADOR,
    equipamento.nomenclatura as EQUIPAMENTO, 
    solicitacao.Status,
    solicitacao.Data, 
    solicitacao.DataM
    FROM solicitacao
    JOIN
     cliente ON solicitacao.ClienteId = cliente.id
    JOIN
     equipamento ON solicitacao.EquipamentId = equipamento.id
     WHERE solicitacao.Status='Em Curso'`;
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error retrieving solicitacoes em curso:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving solicitacoes em curso' });
        }

        res.json({ success: true, message: 'Solicitacoes em curso carregadas com sucesso!', data: result });
    });
  });

//get the total of solicitacoes with the status 'Pendente'
  app.get('/solicitacoes/pendentes/total', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM solicitacao WHERE Status="Pendente"', (err, result) => {
        if (err) {
            console.error('Error retrieving total solicitacoes pendentes:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving total solicitacoes pendentes' });
        }

        res.json({ success: true, message: 'Total de solicitacoes pendentes carregado com sucesso!', data: result[0].total });
    });
  });
  
//get the total of solicitacoes with the status 'Em Curso'
  app.get('/solicitacoes/em-curso/total', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM solicitacao WHERE Status="Em Curso"', (err, result) => {
        if (err) {
            console.error('Error retrieving total solicitacoes em curso:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving total solicitacoes em curso' });
        }

        res.json({ success: true, message: 'Total de solicitacoes em curso carregado com sucesso!', data: result[0].total });
    });
  });
  
//get the total of solicitacoes with the status 'Concluida'
  app.get('/solicitacoes/concluidas/total', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM solicitacao WHERE Status="Concluida"', (err, result) => {
        if (err) {
            console.error('Error retrieving total solicitacoes concluidas:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving total solicitacoes concluidas' });
        }

        res.json({ success: true, message: 'Total de solicitacoes concluidas carregado com sucesso!', data: result[0].total });
    });
  });

  // Endpoint to get all solicitacoes by cliente
  app.get('/clientes/:id/solicitacoes', (req, res) => {
    const { id } = req.params;
    const query = `SELECT 
    solicitacao.id, 
    cliente.nome as SOLICITADOR,
    equipamento.nomenclatura as EQUIPAMENTO,
    equipamento.preco as PRECO, 
    solicitacao.Status, 
    solicitacao.Data,
    solicitacao.Localizacao,  
    solicitacao.DataM,
    solicitacao.Service
    FROM solicitacao
    JOIN
     cliente ON solicitacao.ClienteId = cliente.id
    JOIN
     equipamento ON solicitacao.EquipamentId = equipamento.id
     WHERE cliente.id =?`; 

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error retrieving solicitacoes by cliente:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving solicitacoes by cliente' });
        }

        res.json({ success: true, message: 'Solicitacoes carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to get all solicitacoes by equipamento
  app.get('/equipamentos/:id/solicitacoes', (req, res) => {
    const { id } = req.params;
    
    const query = `SELECT 
    solicitacao.id, 
    solicitacao.localizacao, 
    cliente.nome as SOLICITADOR,
    equipamento.nomenclatura as EQUIPAMENTO,
    equipamento.preco as Preco, 
    solicitacao.Status, 
    solicitacao.Data, 
    solicitacao.DataM
    FROM solicitacao
    JOIN 
       cliente ON solicitacao.ClienteId = cliente.id
    JOIN 
       equipamento ON solicitacao.EquipamentId = equipamento.id
    WHERE equipamento.id =?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error retrieving solicitacoes by equipamento:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving solicitacoes by equipamento' });
        }

        res.json({ success: true, message: 'Solicitacoes carregadas com sucesso!', data: result });
    });
  });

// Endpoint to get the total number of solicitacoes
  app.get('/solicitacoes/total', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM solicitacao', (err, result) => {
        if (err) {
            console.error('Error retrieving total solicitacoes:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving total solicitacoes' });
        }

        res.json({ success: true, message: 'Total de solicitacoes carregado com sucesso!', data: result[0].total });
    });
  });

  
// Endpoint to add on the fila
  app.post('/fila', (req, res) => {
    const { ClienteId, EquipamentoId, Data } = req.body;
    
    db.query('INSERT INTO fila SET?', { ClienteId, EquipamentoId, Data }, (err, result) => {
      if (err) {
          console.error('Error inserting fila:', err);
          return res.status(500).json({ success: false, message: 'Error inserting fila' });
      }
      
      res.json({ success: true, message: 'Fila inserida com sucesso!', filaId: result.insertId });
    });
  });
  
// Endpoint to get the fila
  app.get('/filas', (req, res) => {
    db.query('SELECT * FROM fila', (err, result) => {
        if (err) {
            console.error('Error retrieving fila:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving filas' });
        }

        res.json({ success: true, message: 'Filas carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to delete fila
  app.delete('/fila/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM fila WHERE id=?', [id], (err, result) => {
      if (err) {
          console.error('Error deleting fila:', err);
          return res.status(500).json({ success: false, message: 'Error deleting fila' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Fila não encontrada' });
      }
      
      res.json({ success: true, message: 'Fila deletada com sucesso!' });
    });
  });
  
// Endpoint to add vendafeita
  app.post('/vendaFeita', (req, res) => {
    console.log("Dados recebidos:", req.body);

    const { ClienteId, EquipamentId, AtendenteId, TecnicoId, Data, localizacao, DataM, Service, Status} = req.body;
    const query = 'INSERT INTO vendafeita (ClienteId, EquipamentId, AtendenteId, TecnicoId, Data, localizacao, DataM, Service, Status) VALUES (?,?,?,?,?,?,?,?,?)'
    
    db.query(query, [ ClienteId, EquipamentId, AtendenteId, TecnicoId, Data, localizacao, DataM, Service, Status  ], (err, result) => {
      if (err) {
          console.error('Error inserting vendafeita:', err);
          return res.status(500).json({ success: false, message: 'Error inserting vendafeita' });
      }
      
      res.json({ success: true, message: 'Venda feita com sucesso!', vendafeitaId: result.insertId });
    });
  });
  
// Endpoint to get all vendas feitas
  app.get('/vendafeitas', (req, res) => {
    const query = `SELECT
    vendafeita.id, 
    cliente.nome as SOLICITADOR,
    equipamento.nomenclatura as EQUIPAMENTO,
    equipamento.preco as Preco,
    atendente.nome as ATENDENTE,
    tecnico.nome as TECNICO,
    vendafeita.Data, 
    vendafeita.localizacao, 
    vendafeita.DataM
    FROM vendafeita
    JOIN
     cliente ON vendafeita.ClienteId = cliente.id
    JOIN
     equipamento ON vendafeita.EquipamentId = equipamento.id
    JOIN
     atendente ON vendafeita.AtendenteId = atendente.id
    JOIN
     tecnico ON vendafeita.TecnicoId = tecnico.id`;
   
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error retrieving vendas feitas:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving vendas feitas' });
        }

        res.json({ success: true, message: 'Vendas feitas carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to change the vendas feitas status to 'Concluido'
  app.put('/vendafeitas/:id/concluir', (req, res) => {
    const { id } = req.params;
    
    db.query('UPDATE vendafeita SET Status="Concluida" WHERE id=?', [id], (err, result) => {
      if (err) {
          console.error('Error changing vendas feitas status to Concluido:', err);
          return res.status(500).json({ success: false, message: 'Error changing vendas feitas status to Concluido' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Venda feita não encontrada' });
      }
      
      res.json({ success: true, message: 'Venda feita alterada com sucesso!' });
    });
  });
  
// Endpoint to get the vendas feitas by cliente
  app.get('/clientes/:id/vendafeitas', (req, res) => {
    const { id } = req.params;
    const query = `SELECT
    vendafeita.id, 
    cliente.nome as SOLICITADOR,
    equipamento.nomenclatura as EQUIPAMENTO, 
    equipamento.preco as PRECO, 
    atendente.nome as ATENDENTE,
    tecnico.nome as TECNICO,
    vendafeita.Data, 
    vendafeita.Localizacao, 
    vendafeita.DataM,
    vendafeita.Status,
    vendafeita.Service
    FROM vendafeita
    JOIN
     cliente ON vendafeita.ClienteId = cliente.id
    JOIN
     equipamento ON vendafeita.EquipamentId = equipamento.id
    JOIN
     atendente ON vendafeita.AtendenteId = atendente.id
    JOIN
     tecnico ON vendafeita.TecnicoId = tecnico.id
     WHERE cliente.id=?`;
     
    db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Error retrieving vendas feitas by cliente:', err);
          return res.status(500).json({ success: false, message: 'Error retrieving vendas feitas by cliente' });
      }
      
      res.json({ success: true, message: 'Vendas feitas carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to get the vendas feitas by tecnico
  app.get('/tecnicos/:id/vendafeitas', (req, res) => {
    const { id } = req.params;
    const query =`SELECT
    vendafeita.id, 
    cliente.nome as SOLICITADOR,
    cliente.email as Email,
    equipamento.nomenclatura as EQUIPAMENTO, 
    atendente.nome as ATENDENTE,
    tecnico.nome as TECNICO,
    vendafeita.Data, 
    vendafeita.localizacao, 
    vendafeita.DataM
    FROM vendafeita
    JOIN
     cliente ON vendafeita.ClienteId = cliente.id
    JOIN
     equipamento ON vendafeita.EquipamentId = equipamento.id
    JOIN
     atendente ON vendafeita.AtendenteId = atendente.id
    JOIN
     tecnico ON vendafeita.TecnicoId = tecnico.id
     WHERE tecnico.id=?`;    

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error retrieving vendas feitas by tecnico:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving vendas feitas by tecnico' });
        }

        res.json({ success: true, message: 'Vendas feitas carregadas com sucesso!', data: result });
    });
  });
  
  // Endpoint to get the vendas feitas by tecnico and status = 'Em Curso'
  app.get('/tecnicos/:id/vendafeitas/em-curso', (req, res) => {
    const { id } = req.params;
    const query = `SELECT
    vendafeita.id, 
    cliente.nome as SOLICITADOR,
    cliente.email as Email,
    equipamento.nomenclatura as EQUIPAMENTO,
    equipamento.preco as Preco, 
    atendente.nome as ATENDENTE,
    tecnico.nome as TECNICO,
    vendafeita.Data, 
    vendafeita.localizacao, 
    vendafeita.DataM,
    vendafeita.Status
    FROM vendafeita
    JOIN
     cliente ON vendafeita.ClienteId = cliente.id
    JOIN
     equipamento ON vendafeita.EquipamentId = equipamento.id
    JOIN
     atendente ON vendafeita.AtendenteId = atendente.id
    JOIN
     tecnico ON vendafeita.TecnicoId = tecnico.id
     WHERE tecnico.id=? AND vendafeita.Status='Em Curso'`;   
    db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Error retrieving vendas feitas by tecnico and status = "Em Curso":', err);
          return res.status(500).json({ success: false, message: 'Error retrieving vendas feitas by tecnico and status = "Em Curso"' });
      }
      
      res.json({ success: true, message: 'Vendas feitas carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to get the vendas feitas by equipamento
  app.get('/equipamentos/:id/vendafeitas', (req, res) => {
    const { id } = req.params;
    const query = `SELECT
    vendafeita.id, 
    cliente.nome as SOLICITADOR,
    equipamento.nomenclatura as EQUIPAMENTO,
    equipamento.preco, 
    atendente.nome as ATENDENTE,
    tecnico.nome as TECNICO,
    vendafeita.Data, 
    vendafeita.localizacao, 
    vendafeita.DataM,
    vendafeita.Status,
    vendafeita.Service
    FROM vendafeita
    JOIN
     cliente ON vendafeita.ClienteId = cliente.id
    JOIN
     equipamento ON vendafeita.EquipamentId = equipamento.id
    JOIN
     atendente ON vendafeita.AtendenteId = atendente.id
    JOIN
     tecnico ON vendafeita.TecnicoId = tecnico.id 
     WHERE equipamento.id=?`;  

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error retrieving vendas feitas by equipamento:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving vendas feitas by equipamento' });
        }

        res.json({ success: true, message: 'Vendas feitas carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to get the vendas feitas by Atendente
  app.get('/atendentes/:id/vendafeitas', (req, res) => {
    const { id } = req.params;
    const query = `SELECT
    vendafeita.id, 
    cliente.nome as SOLICITADOR,
    cliente.email as Email,
    equipamento.nomenclatura as EQUIPAMENTO,
    equipamento.preco as Preco, 
    atendente.nome as ATENDENTE,
    tecnico.nome as TECNICO,
    vendafeita.Data, 
    vendafeita.localizacao, 
    vendafeita.DataM
    FROM vendafeita
    JOIN
     cliente ON vendafeita.ClienteId = cliente.id
    JOIN
     equipamento ON vendafeita.EquipamentId = equipamento.id
    JOIN
     atendente ON vendafeita.AtendenteId = atendente.id
    JOIN
     tecnico ON vendafeita.TecnicoId = tecnico.id
     WHERE atendente.id=?`;   

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error retrieving vendas feitas by atendente:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving vendas feitas by atendente' });
        }

        res.json({ success: true, message: 'Vendas feitas carregadas com sucesso!', data: result });
    });
  });
  
// Endpoint to get the total number of vendas feitas
  app.get('/vendafeitas/total', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM vendafeita', (err, result) => {
        if (err) {
            console.error('Error retrieving total vendas feitas:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving total vendas feitas' });
        }

        res.json({ success: true, message: 'Total de vendas feitas carregado com sucesso!', data: result[0].total });
    });
  });
  
  //Endpoint to get the total number of vendas feitas with status 'Concluido' by each tecnico
  app.get('/tecnicos/total-concluido', (req, res) => {
    const query = `
        SELECT tecnico.nome as Tecnico, COUNT(*) AS total
        FROM vendafeita
        JOIN tecnico ON vendafeita.TecnicoId = tecnico.id
        WHERE vendafeita.Status = 'Concluida'
        GROUP BY tecnico.nome
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Erro ao recuperar total de vendas por técnico:', err);
            return res.status(500).json({ success: false, message: 'Erro ao recuperar dados', error: err });
        }

        console.log("Dados do gráfico carregados com sucesso:", result);
        res.json({ success: true, message: 'Total de vendas por técnico carregado com sucesso!', data: result });
    });
});
     
 
// Gerar PDF com as informações da venda feita      
app.get('/gerar-pdf/:id', (req, res) => {
  const { id } = req.params;

  db.query(`
      SELECT 
          vendafeita.id, 
          cliente.nome as Cliente,
          cliente.email as Email, 
          equipamento.nomenclatura as Equipamento,
          equipamento.preco as Preco, 
          atendente.nome as Atendente,
          tecnico.nome as Tecnico,
          vendafeita.Data, 
          vendafeita.localizacao
      FROM vendafeita
      JOIN cliente ON vendafeita.ClienteId = cliente.id
      JOIN equipamento ON vendafeita.EquipamentId = equipamento.id
      JOIN atendente ON vendafeita.AtendenteId = atendente.id
      JOIN tecnico ON vendafeita.TecnicoId = tecnico.id
      WHERE vendafeita.id = ?`, [id], async (err, result) => {

      if (err || result.length === 0) {
          console.error('Erro ao buscar informações da venda:', err);
          return res.status(500).json({ success: false, message: 'Erro ao gerar PDF' });
      }

      const venda = result[0];

      // Criar o PDF na memória
      const doc = new PDFDocument();
      let buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
          const pdfBuffer = Buffer.concat(buffers);
          const pdfBase64 = pdfBuffer.toString('base64'); // Converter para Base64

          try {
              await enviarEmail(
                  venda.Email,
                  "Recibo de Compra - TechSave",
                  "Obrigado por escolher a TechSave! Em anexo, o recibo da sua compra.",
                  {
                      filename: `recibo_${id}.pdf`,
                      content: pdfBase64,
                      encoding: 'base64'
                  }
              );

              res.json({ success: true, message: 'PDF gerado e enviado por e-mail!' });
          } catch (error) {
              console.error("Erro ao enviar e-mail:", error);
              res.status(500).json({ success: false, message: 'Erro ao enviar e-mail' });
          }
      });

      // Criar conteúdo do PDF
      doc.fontSize(16).text("Recibo de Compra - TechSave", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Cliente: ${venda.Cliente}`);
      doc.text(`Equipamento: ${venda.Equipamento}`);
      doc.text(`Preço: ${venda.Preco} Kz`);
      doc.text(`Atendente: ${venda.Atendente}`);
      doc.text(`Técnico: ${venda.Tecnico}`);
      doc.text(`Data: ${venda.Data}`);
      doc.text(`Localização: ${venda.localizacao}`);
      doc.end();
  });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});