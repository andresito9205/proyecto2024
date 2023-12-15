// logout.js
const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).send('Error al cerrar sesión');
        } else {
            res.redirect('/login'); // Redirige a la página de inicio de sesión
        }
    });
});

module.exports = router;
