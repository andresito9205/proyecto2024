const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',  // Cambiado a 'localhost'
    user: 'root',  // Cambiado a 'root'
    password: '',  // Contraseña vacía
    database: 'database'  // Asegúrate de reemplazar 'tu_base_de_datos' con el nombre de tu base de datos
});

connection.connect((error) => {
    if (error) {
        console.log('El error de conexión es: ' + error);
        return;
    }
    console.log('Conectado a la base de datos');
});

module.exports = connection;
