// Importación de módulos y configuración básica
const express = require('express');  // Importa el módulo Express
const app = express();  // Crea una instancia de la aplicación Express
const path = require('path');  // Proporciona utilidades para trabajar con rutas de archivos y directorios
const http = require('http');  // Módulo HTTP de Node.js
const socketIo = require('socket.io');  // Biblioteca para habilitar la comunicación en tiempo real mediante WebSockets
const bcrypt = require('bcryptjs');  // Biblioteca para el cifrado de contraseñas
const bodyParser = require('body-parser');  // Middleware para analizar los cuerpos de las solicitudes HTTP

const mysql = require('mysql');  // Módulo para la conexión y manipulación de bases de datos MySQL
const router = express.Router();  // Objeto Router de Express para gestionar rutas
const uuid = require('uuid');  // Generador de identificadores únicos
const crypto = require('crypto');  // Módulo criptográfico de Node.js
const md5 = require('md5');  // Función de resumen criptográfico MD5
const connection = require('./database/db');  // Conexión a la base de datos MySQL
const logoutRouter = require('./database/logout');  // Router para la funcionalidad de cierre de sesión


// Configuración de Rutas:
app.use('/logout', logoutRouter);

// Configuración de body-parser para analizar datos codificados en URL y JSON:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de Sesión con express-session:
const session = require('express-session');
app.use(session({
  secret: 'hola',         // Clave secreta para firmar la sesión
  resave: false,          // No volver a guardar la sesión si no hay cambios
  saveUninitialized: true  // Guardar sesiones no inicializadas
}));

// Configuración adicional de analizar datos codificados en URL y JSON con Express:
app.use(express.urlencoded({ extended: false })); 
app.use(express.json());

// Configuración del Motor de Vistas (EJS):
app.set('view engine', 'ejs');

// Configuración de Variables de Entorno con dotenv:
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

// Configuración de Recursos Estáticos desde el directorio 'public':
app.use('/resources', express.static('public'));  
app.use('/resources', express.static(__dirname + '/public'));



// Importa la librería bcryptjs para el hash y la comparación de contraseñas:
const bcryptjs = require('bcryptjs');

// Inicializa un contador de reservas para generar identificadores únicos:
let contadorReservas = 0;

// Función que incrementa el contador y devuelve un identificador único:
function obtenerIdentificadorUnico() {
    contadorReservas++;
    return contadorReservas;
}

// Manejo de la solicitud GET a la ruta "/logout":
app.get('/logout', (req, res) => {
    // Destruye la sesión del usuario al cerrar sesión:
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).send('Error al cerrar sesión');
        } else {
            // Redirige al usuario a la página de inicio de sesión después de cerrar sesión correctamente:
            res.redirect('/login');
        }
    });
});



module.exports = router;


// Ruta para manejar la página de confirmación de PayU mediante una solicitud POST:
app.post('/payu/confirmacion', async (req, res) => {
    try {
        // Extrae datos relevantes de la solicitud POST de PayU:
        const merchantId = req.body.merchantId;
        const reference_code = req.body.referenceCode; // Se cambió de referenceCode a reference_code por convención
        const value = req.body.value;
        const currency = req.body.currency;
        const statePol = req.body.state_pol;
        const signature = req.body.signature;

        // Los datos extraídos son esenciales para procesar y validar la confirmación de PayU.
        // A continuación, deberías implementar lógica adicional para verificar y procesar esta información.

        // Por ejemplo, puedes comparar la firma recibida con la firma generada localmente para autenticar la transacción.

        // Asegúrate de agregar la lógica necesaria para gestionar la confirmación de PayU de manera segura.

        // Validar la firma

        // Creación de la firma esperada para validar la autenticidad de la transacción con PayU:
        const expectedSignature = crypto
            .createHash('md5') // Utiliza el algoritmo de hash MD5
            .update(`${apiKey}~${merchantId}~${reference_code}~${value}~${currency}~${statePol}`)
            .digest('hex');


            if (signature === expectedSignature) {
                // La firma es válida, puedes procesar la información y actualizar tu base de datos
                console.log('Firma válida. Procesando la transacción...');
            

            // Almacenar statePol en la sesión
            req.session.statePol = statePol;

            // Actualizar la base de datos con el estado de la transacción
            const updateResult = await actualizarEstadoReservaEnBaseDeDatos(statePol, reference_code);

            // Verifica si al menos una fila fue afectada por la operación de actualización en la base de datos:
            if (updateResult.affectedRows > 0) {
            // Se ejecuta si al menos una fila fue actualizada exitosamente:

            // Muestra un mensaje indicando que el estado de la transacción fue actualizado con éxito en la base de datos:
             console.log('Estado de transacción actualizado en la base de datos');

            // Inserta datos en la tabla pagos:

             // Define un objeto 'pago' con información relevante sobre la transacción exitosa:
            const pago = {
                referencia: reference_code, // Número de referencia de la transacción
                monto: value, // Monto de la transacción
                estado: 'exitoso', // Estado de la transacción (puede ser exitoso, pendiente, etc.)
                id_pedido: 'PED789', // ID del pedido asociado (ajustar según tus datos)
                fecha_pago: new Date(), // Fecha y hora actuales como marca de tiempo de pago
                id_reserva: 1, // ID de la reserva asociada (ajustar según tus datos)
                name: 'Nombre de Usuario' // Nombre de usuario asociado (ajustar según tus datos)
            };
            // Fin del bloque de código de manejo de la solicitud POST para la confirmación de PayU.







            
            // Inserta el objeto 'pago' en la base de datos utilizando la función 'insertarPago':
            await insertarPago(pago);
            
            // Envía una respuesta exitosa (código 200) al cliente indicando que la transacción se procesó correctamente:
            res.status(200).send('OK');
            } else {
                // Se ejecuta si no se encontró la reserva en la base de datos:
            
                // Muestra un mensaje de registro indicando que no se encontró la reserva en la base de datos:
                console.log('No se encontró la reserva en la base de datos');
            
                // Envía una respuesta de "No encontrado" (código 404) al cliente:
                res.status(404).send('Reserva no encontrada en la base de datos');
            }
            } else {
                // Se ejecuta si la firma no coincide, indicando que la transacción podría no ser válida:
            
                // Muestra un mensaje de error indicando que la firma en la página de confirmación de PayU no es válida:
                console.error('Firma no válida en la página de confirmación de PayU');
            
                // Envía una respuesta de "Solicitud incorrecta" (código 400) al cliente:
                res.status(400).send('Firma no válida');
            }
            } catch (error) {
                // Se ejecuta en caso de algún error durante el procesamiento de la confirmación de PayU:
            
                // Muestra un mensaje de error indicando el problema específico:
                console.error('Error al procesar la confirmación de PayU:', error);
            
                // Envía una respuesta de "Error interno del servidor" (código 500) al cliente:
                res.status(500).send('Error al procesar el pago');
            }
            });
            

// Otras funciones y rutas...




// Función asíncrona para actualizar el estado de la reserva en la base de datos:
async function actualizarEstadoReservaEnBaseDeDatosAsync(statePol, reference_code) {
    // Implementa la lógica para actualizar el estado de la reserva en la base de datos
    return new Promise((resolve, reject) => {
        // Definición de la consulta SQL para actualizar el estado de la reserva:
        const sql = 'UPDATE reservas SET estado_transaccion = ? WHERE reference_code = ?';
        
        // Valores a ser utilizados en la consulta SQL:
        const values = [statePol, reference_code];

        // Ejecución de la consulta SQL utilizando la conexión a la base de datos:
        connection.query(sql, values, (error, results) => {
            // Manejo de errores o resolución exitosa de la consulta:
            if (error) {
                // Se ejecuta si hay un error durante la ejecución de la consulta:
                reject(error);
            } else {
                // Se ejecuta si la consulta se ejecuta con éxito:

                // Resuelve la promesa con los resultados de la consulta:
                resolve(results);
            }
        });
    });
}


// Función asíncrona para insertar un pago en la base de datos:
async function insertarPagoAsync(pago) {
    // Implementa la lógica para insertar el pago en la base de datos
    return new Promise((resolve, reject) => {
        // Definición de la consulta SQL para insertar un pago:
        const sql = 'INSERT INTO pagos SET ?';
        
        // Datos del pago que se insertarán en la base de datos:
        connection.query(sql, pago, (error, results) => {
            // Manejo de errores o resolución exitosa de la consulta:
            if (error) {
                // Se ejecuta si hay un error durante la ejecución de la consulta:
                reject(error);
            } else {
                // Se ejecuta si la consulta se ejecuta con éxito:

                // Resuelve la promesa con los resultados de la consulta:
                resolve(results);
            }
        });
    });
}



//FUNCIONES

// Actualizar el estado de la reserva en la base de datos de manera asíncrona
async function actualizarEstadoReservaEnBaseDeDatos(statePol, reference_code) {
    try {
        return await actualizarEstadoReservaEnBaseDeDatosAsync(statePol, reference_code);
    } catch (error) {
        throw new Error(`Error en actualizarEstadoReservaEnBaseDeDatos: ${error.message}`);
    }
}



// Insertar un pago en la base de datos de manera asíncrona
async function insertarPago(pago) {
    try {
        // Llama a la función asíncrona insertarPagoAsync para realizar la inserción:
        return await insertarPagoAsync(pago);
    } catch (error) {
        // Captura cualquier error durante la inserción y lanza una nueva excepción con un mensaje más descriptivo:
        throw new Error(`Error en insertarPago: ${error.message}`);
    }
}






// Función para actualizar el estado de la transacción en la base de datos de manera asíncrona
async function actualizarEstadoTransaccionAsync(statePol, reference_code) {
    try {
        return new Promise((resolve, reject) => {
            // Implementa la lógica para actualizar el estado de la transacción en la base de datos
            const sql = 'UPDATE reservas SET estado_transaccion = ? WHERE reference_code = ?';
            const values = [statePol, reference_code];

            connection.query(sql, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    } catch (error) {
        throw new Error(`Error en actualizarEstadoTransaccionAsync: ${error.message}`);
    }
}






// Ruta para manejar la notificación de PayU
app.post('/payu/notificacion', async (req, res) => {
    try {
        // Obtener datos de la notificación de PayU
        const merchantId = req.body.merchantId;
        const reference_code = req.body.referenceCode; // Cambiado de referenceCode a reference_code
        const TX_VALUE = req.body.TX_VALUE;
        const currency = req.body.currency;
        const transactionState = req.body.transactionState;
        const firmaCadena = `${apiKey}~${merchantId}~${reference_code}~${TX_VALUE}~${currency}~${transactionState}`; // Cambiado de referenceCode a reference_code
        const firmaEsperada = md5(firmaCadena);
        const firmaRecibida = req.body.signature;

        // Verificar la firma
        if (firmaEsperada === firmaRecibida) {
            // La firma es válida, puedes procesar la notificación
            // Actualizar el estado del pago en tu base de datos, por ejemplo
            console.log('Notificación recibida de PayU:', req.body);

            // Obtener el estado de la transacción de la notificación
            const statePol = transactionState;

            // Actualizar la base de datos con el estado de la transacción de manera asíncrona
            const resultadoActualizacion = await actualizarEstadoTransaccionAsync(statePol, reference_code);

            // Enviar una respuesta a PayU indicando que la notificación fue recibida correctamente
            res.status(200).send('OK');
        } else {
            // La firma no coincide, la notificación podría no ser válida
            console.error('Firma no válida en la notificación de PayU');
            res.status(400).send('Firma no válida');
        }
    } catch (error) {
        console.error('Error en la notificación de PayU:', error.message);
        res.status(500).send('Error al procesar la notificación');
    }
});



// Ruta para manejar la página de pagos (funcional)
app.get('/pago', (req, res) => {
    // Verificar si el usuario está autenticado
    if (!req.session.isLoggedIn) {
        // Si no está autenticado, redirigir a la página de inicio de sesión
        res.redirect('/login');
        return;
    }

    // Calcular la firma y otros datos necesarios
    const reference_code = req.session.referenceCode;
    const apiKey = "4Vj8eK4rloUd272L48hsrarnUA";
    const merchantId = "508029"; // Cambia por tu merchantId
    const accountId = "512321"; // Cambia por tu accountId
    const description = "reserva cancha sintetica";
    const amount = "50000";
    const currency = "COP";
    const firmaCadena = `${apiKey}~${merchantId}~${reference_code}~${amount}~${currency}`;
    const firma = crypto.createHash('md5').update(firmaCadena).digest('hex');

    // Renderizar la página de pagos con el reference_code recuperado y la firma calculada
    res.render('pago', { reference_code, firma, accountId, description, amount, currency });
});


const apiKey = "4Vj8eK4rloUd272L48hsrarnUA";


//se calcula la firma para luego enviarle a la pagina payu FUNCIONAL


app.get('/pago', (req, res) => {
    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }

    // Recuperar el reference_code de la tabla de reservas
    const reference_code = req.session.referenceCode;

    // Validar que tengamos un reference_code almacenado en la sesión
    if (!reference_code) {
        // Si no hay reference_code almacenado, puedes manejarlo según tu lógica
        res.status(400).send('No se encontró el reference_code en la sesión.');
        return;
    }

    // Calcular la firma
    const apiKey = "4Vj8eK4rloUd272L48hsrarnUA";
    const merchantId = "508029"; // Cambia por tu merchantId
    const accountId = "512321"; // Cambia por tu accountId
    const description = "reserva cancha sintetica";
    const amount = "50000";
    const currency = "COP";
    const firmaCadena = `${apiKey}~${merchantId}~${reference_code}~${amount}~${currency}`;
    const firma = crypto.createHash('md5').update(firmaCadena).digest('hex');

    // Renderiza la página de pagos con el reference_code recuperado y la firma calculada
    res.render('pago', { reference_code, firma, accountId, description, amount, currency });
});


// Código de manejo de la solicitud para la ruta '/'
app.get('/', (req, res) => {
    res.render('index', { msg: 'ESTO ES UN MENSAJE DESDE NODE' });  
});


// Define una ruta para la URL '/login'
app.get('/login', (req, res) => {   // Código de manejo de la solicitud para la ruta '/login'
     // Renderiza la plantilla 'login'
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});


app.get('/mis_reservas', async (req, res) => {
    const idUsuario = req.session.userId; // assuming you have the user's ID in the session
    const reservas = await obtenerReservasUsuarioAsync(idUsuario);
    res.render('mis_reservas', { reservas: reservas });
});


app.get('/reservas', (req, res) => {
    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }

    connection.query('SELECT * FROM canchas WHERE estado = "disponible"', (error, results) => {
        if (error) throw error;

        res.render('reservas.ejs', { reservaExitosa: false, canchas: results });
    });
});

app.get('/precioCancha/:id', (req, res) => {
    const canchaId = req.params.id;

    connection.query('SELECT precio FROM canchas WHERE id = ?', [canchaId], (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            const precioCancha = results[0].precio;
            res.json({ precioCancha });
        } else {
            res.status(404).json({ error: 'Cancha no encontrada' });
        }
    });
});


//FUNCION FUNCIONAL

function obtenerEstadoTransaccion() {
    return new Promise((resolve, reject) => {
        // Implementación de la lógica para obtener el estado de la transacción desde la base de datos
        // Aquí deberías realizar la consulta a tu base de datos y resolver o rechazar la promesa en consecuencia.
        // Por ahora, devolvemos un estado estático para propósitos de ejemplo.
        resolve('COMPLETADA');
    });
}


//FUNCION FUNCIONAL

function generarReferenceCode() {
    const timestamp = Date.now(); // Obtener la marca de tiempo actual en milisegundos
    const identificadorUnico = obtenerIdentificadorUnico(); // Obtener un identificador único (puedes usar tu lógica actual)
    const reference_code = `RES${timestamp}${identificadorUnico}`; // Cambiado de referenceCode a reference_code

    return reference_code;
}


// Función para actualizar el estado del pago asociado a una reserva
async function actualizarEstadoPagoAsociadoAReserva(idReserva) {
    try {
        // Obtener el código de referencia de la reserva
        const codigoDeReferencia = generarReferenceCode(idReserva); // Ajusta según la lógica real

        // Definir el nuevo estado del pago (por ejemplo, 'pagada')
        const nuevoEstado = 'pagada';

        // Datos del pagador (ajusta según lo que recibes de PayU)
        const nombrePagador = 'Nombre del Pagador'; 
        const montoPagado = 50000;  // Ejemplo de monto, ajusta según lo que recibes de PayU
        // ... otros datos del pagador que quieras almacenar

        // Llamar a la función para marcar el pago como "pagado" en la base de datos
        const resultado = await marcarPagoComoPagadoAsync(codigoDeReferencia, nuevoEstado);

        // Insertar los datos del pagador en la tabla pagos
        await insertarDatosPagadorAsync(codigoDeReferencia, nombrePagador, montoPagado, /* otros datos */);

        return resultado;
    } catch (error) {
        throw new Error(`Error al actualizar el estado del pago asociado a la reserva: ${error.message}`);
    }
}


// Ruta para manejar el proceso de reservas
app.post('/reservas', async (req, res) => {
    try {
        const idCancha = req.body.cancha;
        const fechaReserva = req.body.fecha;
        const horaReserva = req.body.hora;
        const idUsuario = req.session.userId;

        // Obtener el estado de la transacción de la sesión
        let statePol = req.session.statePol;

        // Verificar si statePol está definido en la sesión
        if (!statePol) {
            // Si no está definido, obtener el estado de la transacción de la base de datos
            statePol = await obtenerEstadoTransaccion();
            // Guardar statePol en la sesión
            req.session.statePol = statePol;
        }

        // Generar el código de referencia y guardarlo en la sesión
        const reference_code = generarReferenceCode();
        req.session.referenceCode = reference_code;

        // Crear el objeto de reserva
        const reserva = {
            id_cancha: idCancha,
            id_usuario: idUsuario,
            fecha_reserva: fechaReserva,
            hora_reserva: horaReserva,
            estado: 'reservada',
            estado_transaccion: statePol,
            reference_code: reference_code
        };

        // Insertar la reserva en la base de datos
        await insertarReserva(reserva);

        // Actualizar el estado de la cancha en la base de datos
        await actualizarEstadoCancha('reservada', idCancha);

        // Renderizar la página de reservas exitosa
        res.render('reservas.ejs', { reservaExitosa: true, canchas: [], idUsuario });
    } catch (error) {
        console.error('Error en la reserva:', error.message);
        res.status(500).send('Ocurrió un error en la reserva');
    }
});



// Función para insertar una reserva en la base de datos FUNCIONAL 
function insertarReserva(reserva) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO reservas SET ?', reserva, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


// Ruta para mostrar reservas y permitir su cancelación
app.get('/cancelar_reservas', async (req, res) => {
    try {
        const idUsuario = req.session.userId;

        // Obtener las reservas del usuario actual
        const reservas = await obtenerReservasUsuarioAsync(idUsuario);

        res.render('cancelar_reservas', { reservas });
    } catch (error) {
        console.error('Error al cargar la página de cancelación de reservas:', error.message);
        res.status(500).send('Ocurrió un error al cargar la página de cancelación de reservas.');
    }
});





// Ruta para cancelar una reserva
app.post('/cancelar_reserva', async (req, res) => {
    try {
        const idReserva = req.body.id_reserva;
        const idUsuario = req.session.userId;

        // Obtener la reserva por su ID
        const reserva = await obtenerReservaPorIdAsync(idReserva);

        if (reserva && reserva.id_usuario === idUsuario) {
            // Cancelar la reserva (actualizar estado a 'cancelada' y cancha a 'disponible')
            await cancelarReservaAsync(idReserva, reserva.id_cancha);
            res.redirect('/cancelar_reservas');
        } else {
            // La reserva no pertenece al usuario actual
            res.status(403).send('No tienes permisos para cancelar esta reserva.');
        }
    } catch (error) {
        console.error('Error al cancelar la reserva:', error.message);
        res.status(500).send(`Ocurrió un error al cancelar la reserva: ${error.message}`);
    }
});



// Obtener las reservas de un usuario de manera asíncrona
async function obtenerReservasUsuarioAsync(idUsuario) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM reservas WHERE id_usuario = ?', [idUsuario], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Cancelar una reserva de manera asíncrona
async function cancelarReservaAsync(idReserva, idCancha) {
    return new Promise(async (resolve, reject) => {
        try {
            // Obtener información de la reserva antes de cancelarla
            const reserva = await obtenerReservaPorIdAsync(idReserva);

            // Verificar si la reserva existe y si ya no está cancelada
            if (reserva && reserva.estado !== 'cancelada') {
                // Actualizar estado de la reserva a 'cancelada'
                await connection.query('UPDATE reservas SET estado = ? WHERE id = ?', ['disponible', idReserva]);

                // Si la reserva tiene una cancha asociada, actualizar estado de la cancha a 'disponible'
                if (reserva.id_cancha) {
                    await connection.query('UPDATE canchas SET estado = ? WHERE id = ?', ['disponible', reserva.id_cancha]);
                }

                resolve();
            } else {
                // La reserva ya estaba cancelada
                reject(new Error('La reserva ya estaba cancelada.'));
            }
        } catch (error) {
            reject(error);
        }
    });
}


// Función para obtener una reserva por su ID de manera asíncrona
async function obtenerReservaPorIdAsync(idReserva) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM reservas WHERE id = ?';
        connection.query(sql, [idReserva], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0]); // Devolver la primera fila (debería ser única)
            }
        });
    });
}




// Función para actualizar el estado de una cancha en la base de datos
function actualizarEstadoCancha(estado, idCancha) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE canchas SET estado = ? WHERE id = ?', [estado, idCancha], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


   app.delete('/reservas/:id', function (req, res) {
    var idReserva = req.params.id;
    connection.query('DELETE FROM reservas WHERE id = ?', [idReserva], function (error, results, fields) {
      if (error) throw error;
      res.end('Reserva ha sido eliminada!');
    });
  });


app.get('/datos_usuarios', (req, res) => {
    // Aquí puedes realizar consultas a la base de datos y pasar los resultados a la vista
    connection.query('SELECT * FROM reservas', (error, results) => {
        if (error) throw error;
      
        // Filtrar los resultados
        let reservasFiltradas = results.filter(reserva => reserva.estado === "reservada" || reserva.estado === "disponible");
      
        // Renderizar la vista de administrador con los resultados filtrados
        res.render('datos_usuarios', { data: reservasFiltradas });
     });
 });
 

app.get('/dashboard', (req, res) => {
    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }
    res.render('dashboard');
});



app.get('/dash', (req, res) => {
    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }
    res.render('dash');
});




// Maneja solicitudes POST a la URL '/auth'
app.post('/auth', async (req, res) => {
    
    const name = req.body.name; // Obtiene el nombre de usuario y la contraseña del cuerpo de la solicitud
    const pass = req.body.pass;

    // Imprime en la consola el nombre de usuario y la contraseña (solo con fines de depuración)
    console.log('Nombre de usuario:', name, 'Contraseña:', pass);

    // Verifica si se proporcionaron tanto el nombre de usuario como la contraseña

    if (name && pass) {
        // Realiza una consulta a la base de datos para buscar un usuario con el nombre proporcionado
        connection.query('SELECT * FROM users WHERE name = ?', [name], async (error, results) => {
            // Maneja errores de consulta a la base de datos
            if (error) {
                console.error(error);
                // Renderizar la página de inicio de sesión con un mensaje de error
                res.render('login', { error: 'Ocurrió un error' });
                return;
            }
// Comprueba si no se encontró ningún usuario o si la contraseña no coincide
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                console.log('Inicio de sesión incorrecto. Nombre de usuario o contraseña incorrectos');
                // Renderizar la página de inicio de sesión con un mensaje de error
                res.render('login', { error: 'Nombre de usuario o contraseña incorrectos' });
            } else {
                // Almacena el rol del usuario en la sesión
                req.session.isLoggedIn = true;
                req.session.userId = results[0].id;
                req.session.userRole = results[0].rol;

                // Redirige a un dashboard según el rol del usuario
                if (req.session.userRole === 'Admin') {
                    res.redirect('/dash');
                } else {
                    res.redirect('/dashboard');
                }
            }
        });
    } else {
        console.log('Faltan credenciales');
        // Renderizar la página de inicio de sesión con un mensaje de error
        res.render('login', { error: 'Faltan credenciales' });
    }
});






//FUNCIONAL

app.post('/register', async (req, res) => {
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8);

    try {
        connection.query('INSERT INTO users SET ?', { name: name, rol: rol, pass: passwordHash }, (error, results) => {
            if (error) {
                console.log(error);
                // En caso de error, proporciona un mensaje claro al usuario
                res.render('register', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Error al registrar el usuario. Por favor, verifica tus datos e inténtalo de nuevo.",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: null,
                    ruta: '/register' // Puedes redirigir a otra ruta si lo deseas
                });
            } else {
                // Registro exitoso
                res.render('register', {
                    alert: true,
                    alertTitle: "Registrado",
                    alertMessage: "¡Registro exitoso!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/login'
                });
            }
        });
    } catch (error) {
        console.error('Error en la inserción del usuario:', error.message);
        // En caso de error, proporciona un mensaje claro al usuario
        res.render('register', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Error al registrar el usuario. Por favor, verifica tus datos e inténtalo de nuevo.",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: null,
            ruta: '/register' // Puedes redirigir a otra ruta si lo deseas
        });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, (req, res) => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});