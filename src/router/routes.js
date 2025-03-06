const express = require('express');
const router = express.Router();
const mainController = require('../controller/controller');
router.use(mainController.setLocals);
// Definir las rutas
router.get('/index', mainController.index);// Página principal
router.get('/login', mainController.login);// Página login
router.get('/dep', mainController.dep);// Página departamento
router.get('/alumno', mainController.alumno);// Página alumno
router.get('/vista', mainController.vista);// Página vista
router.get('/carga', mainController.carga);// Página carga
router.get('/regis', mainController.regis);// Página registro
router.get('/admin', mainController.admin);// Página admin
router.get('/info', mainController.info);// Página admin
router.post('/validar', mainController.funcionregis);// func regis
router.post("/login", mainController.processLogin);
router.get('/carga/:id/:dni', mainController.carga);
router.post("/cargaNotas", mainController.cargaNotas);

module.exports = router;