const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const sessionRoutes = require('./routes/sessions.js');
const productsRoutes = require('./routes/products.js');
const cartsRoutes = require('./routes/carts.js');

const app = express();
const PORT = 8080;

// Middleware para parsear solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar sesiones
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

const passportConfig = require('./config/passport'); // Asegúrate de importar la configuración de Passport
passportConfig; // Ejecuta la configuración
// Configurar Handlebars como motor de plantillas
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas de vistas
app.get('/', (req, res) => {
  console.log("Renderizando la página de inicio");
  res.render('home', { title: 'Home Page' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Registro de Usuario' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
});

app.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.render('current', { title: 'Usuario Actual', user: req.user });
});

// Usar las rutas de sesiones, productos y carritos
app.use('/api/sessions', sessionRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/DesbackII', {
  // Puedes agregar opciones si es necesario
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Página no encontrada' });
});

// Middleware para manejar errores del servidor (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'Error del servidor', message: err.message });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
