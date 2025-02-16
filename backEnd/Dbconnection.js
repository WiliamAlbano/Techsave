const mysql = require('mysql2');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'SGEP'  // banco de dados SGEP, que será usado para a conexão inicial
});

con.connect(function(err) {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log("Connected!");

  // Tente criar o banco de dados TMEDB
  con.query("CREATE DATABASE IF NOT EXISTS TMEDB", function (err, result) {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log("Database created or already exists");
  });
});