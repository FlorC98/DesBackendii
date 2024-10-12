const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router(); 

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, age, role } = req.body;

  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Encriptar la contraseña antes de guardar
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear un nuevo usuario
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      age,
      role: role || 'user'
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    // Crear un carrito para el usuario
    const newCart = new Cart({ user: newUser._id, products: [] });
    await newCart.save();

    // Asignar el carrito al usuario
    newUser.cart = newCart._id;
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});
// Ruta para iniciar sesión (login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.cookie('jwt', token, { httpOnly: true });
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

// Ruta para obtener los datos del usuario logueado
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ user: req.user });
});



module.exports = router; // Asegúrate de exportar correctamente el router
