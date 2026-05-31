const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/db');
const User = require('./models/user');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Home - list all users
app.get('/', async (req, res) => {
  const users = await User.findAll();
  res.render('index', { users });
});

// Form tambah user
app.get('/add', (req, res) => {
  res.render('form');
});

// Proses tambah user
app.post('/add', async (req, res) => {
  await User.create(req.body);
  res.redirect('/');
});

// Form edit user
app.get('/edit/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.render('edit', { user });
});

// Proses update user
app.post('/edit/:id', async (req, res) => {
  await User.update(req.body, { where: { id: req.params.id } });
  res.redirect('/');
});

// Hapus user
app.get('/delete/:id', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.redirect('/');
});

sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('App running at http://localhost:3000');
    });
  })
  .catch((error) => {
    console.error('Gagal menghubungkan aplikasi ke database:', error);
    process.exit(1);
  });
