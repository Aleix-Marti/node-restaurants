require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// const conn = 'mongodb+srv://aleixmarti:ZpMm086srH2R0mzm@cluster0.7lu1qqu.mongodb.net/'


// // Conexión a la base de datos MongoDB Atlas
// mongoose.connect('URL_de_tu_base_de_datos', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Conexión exitosa a MongoDB'))
//   .catch(err => console.error('Error de conexión a MongoDB:', err));

// // Connexió a la base de dades
// // mongoose.connect('mongodb://localhost:27017/nom-de-la-teva-base-de-dades', { useNewUrlParser: true, useUnifiedTopology: true });

const connectionParams={
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true 
}
mongoose.connect(process.env.MONGODB_URL,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })

// Definición del esquema del restaurante
const restaurantSchema = new mongoose.Schema({
  nombre: String,
  tipoComida: String,
  especialidad: String,
  comentarios: [String],
});

// Modelo de restaurante
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Definición del esquema del usuario
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Modelo de usuario
const User = mongoose.model('User', userSchema);

// Endpoint para registrar usuarios
app.post('/registro', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send('El usuario ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash de la contraseña

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.send('Registro de usuario exitoso');
  } catch (err) {
    res.status(400).send('Error al registrar usuario');
  }
});


// Endpoint para login de usuarios
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        res.send('Login exitoso');
      } else {
        res.status(401).send('Credenciales inválidas');
      }
    } else {
      res.status(401).send('Credenciales inválidas');
    }
  } catch (err) {
    res.status(500).send('Error al iniciar sesión');
  }
});

// Endpoint para crear un restaurante
app.post('/restaurantes', async (req, res) => {
  try {
    const { nombre, tipoComida, especialidad, comentarios } = req.body;
    const restaurante = new Restaurant({ nombre, tipoComida, especialidad, comentarios });
    await restaurante.save();
    res.status(201).json(restaurante);
  } catch (err) {
    res.status(400).send('Error al crear restaurante');
  }
});

// Endpoint para listar todos los restaurantes
app.get('/restaurantes', async (req, res) => {
  try {
    const restaurantes = await Restaurant.find();
    res.json(restaurantes);
  } catch (err) {
    res.status(500).send('Error al obtener restaurantes');
  }
});

// Obtener un restaurante por ID
app.get('/restaurantes/:id', async (req, res) => {
  const restauranteId = req.params.id;

  try {
    const restaurante = await Restaurant.findById(restauranteId);

    if (!restaurante) {
      return res.status(404).send('Restaurante no encontrado');
    }

    res.status(200).json(restaurante);
  } catch (err) {
    res.status(500).send('Error al obtener la información del restaurante');
  }
});

// Endpoint para filtrar restaurantes por tipo de comida
app.get('/restaurantes/:tipoComida', async (req, res) => {
  try {
    const { tipoComida } = req.params;
    const restaurantes = await Restaurant.find({ tipoComida });
    res.json(restaurantes);
  } catch (err) {
    res.status(500).send('Error al obtener restaurantes por tipo de comida');
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
