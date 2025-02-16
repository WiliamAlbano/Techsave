const mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "PequenoAstro3!"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE TMEDB", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});