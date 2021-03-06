require("dotenv").config(); // gestiona las variables de entorno .env
const path = require("path");
const express = require("express"); // aplicacion para web para arrancar el servidor
const morgan = require("morgan"); // imprimo datos de la peticion desde postman metodo ruta
const fileUpload = require("express-fileupload"); // para leer el body form data para la subida de imagenes
const cors = require("cors"); // para que no haya conflictos de los servidores del backend y frontend
const {
  listExperiencias,
  infoExperiencia,
  nuevaExperiencia,
  modExperiencia,
  eliminaExperiencia,
  añadirFotosExperiencia,
  eliminarFotosExperiencia,
  votarExperiencia,
} = require("./controladores/experiencias");

const existeExperiencia = require("./middlewares/existeExperiencia");
const esUsuario = require("./middlewares/esUsuario");
const estaAutorizado = require("./middlewares/estaAutorizado");
const esAdmin = require("./middlewares/esAdmin");

const {
  nuevoUsuario,
  registroUsuario,
  loginUsuario,
} = require("./controladores/usuarios");

const { PORT, HOST, RECURSOS_DIRECTORY } = process.env; //console.log(process.env);

const app = express(); //creo instancia de express - llamo a express() para cada peticion
//tiene un metodo, una ruta y una funcion

// usar cors me permite abrir los dos servidores del backend y frontend en el mismo terminal
app.use(cors());

//con express puedo usar funciones, en esta caso uso morgan y elijo el parametro "dev"
app.use(morgan("dev"));

//para gestionar el body usamos una funcion (middleware de express que es express.json()
app.use(express.json());

//middleware para acceder desde postman a los recursos estaticos
app.use("/fotos", express.static(path.join(__dirname, RECURSOS_DIRECTORY)));

//para gestionar el body para subida de imagenes (multipart form data)
//multer ó express-fileupload
app.use(fileUpload());

//peticiones desde postman
// GET - / Home page
app.get("/", (req, res, next) => {
  res.send({
    status: "ok",
    message: "Página principal",
  });
});

// ENDPOINTS EXPERIENCIAS

//GET - /experiencias - lista todas las experiencias
app.get("/experiencias", listExperiencias);

// GET - /experiencias/:id - muestra la info de una experiencia
app.get("/experiencias/:id", existeExperiencia, infoExperiencia);

// POST - /experiencias/- crea una experiencia
app.post("/experiencias", esUsuario, nuevaExperiencia);

// PUT - /experiencias/:id - edita una experiencia
app.put(
  "/experiencias/:id",
  esUsuario,
  existeExperiencia,
  estaAutorizado,
  modExperiencia
);

// DELETE - /experiencias/:id/fotos/:fotoId - borra una imagen de una experienciapare
app.delete(
  "/experiencias/:id/fotos/:fotoId",
  esUsuario,
  existeExperiencia,
  estaAutorizado,
  eliminarFotosExperiencia
);
// DELETE - /experiencias/:id - borra una experiencia
app.delete(
  "/experiencias/:id",
  esUsuario,
  existeExperiencia,
  esAdmin,
  eliminaExperiencia
);

// POST - /experiencias/:id/fotos - añade una imagen a una experiencia
app.post(
  "/experiencias/:id/fotos",
  esUsuario,
  existeExperiencia,
  estaAutorizado,
  añadirFotosExperiencia
);

// POST - /experiencia/:id/votos/:userId - vota una experiencia
app.post(
  "/experiencia/:id/votos/:idPart",
  esUsuario,
  existeExperiencia,
  votarExperiencia
);

// ENDPOINS USUARIOS

// POST - /usuarios - crea un usuario pendiente de activar (envia email al usuario)
app.post("/usuarios", nuevoUsuario);

// GET - /usuarios/registro/:codigoActivacion - valida un uuario recien registratado (el usuario valida su email)
app.get("/usuarios/registro/:codigoActivacion", registroUsuario);

// POST - /usuarios/login - login de un usuario (devuelve token)
app.post("/usuarios/login", loginUsuario);

// middleware para gestionar todos los errores

app.use((error, req, res, next) => {
  res.status(error.httpStatus || 500).send({
    status: "error",
    message: error.message,
  });
});

// middleware para página no encontrada

app.use((req, res, next) => {
  //console.log(res);
  res.status(404).send({
    status: "error",
    message: "No encontrad@",
  });
});

//express pone en escucha nuestro servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor en escucha en http://${HOST}:${PORT}`);
});
