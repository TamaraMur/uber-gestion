const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Configuración de la base de datos SQLite
const db = new sqlite3.Database(':memory:');

// Crear tablas
db.serialize(() => {
    db.run(`CREATE TABLE vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model TEXT,
        year INTEGER,
        status TEXT,
        current_location TEXT,
        maintenance_history TEXT
    )`);

    db.run(`CREATE TABLE drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        license TEXT,
        status TEXT,
        assigned_vehicle INTEGER,
        FOREIGN KEY (assigned_vehicle) REFERENCES vehicles(id)
    )`);

    db.run(`CREATE TABLE inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        quantity INTEGER,
        location TEXT,
        status TEXT
    )`);

    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        credentials TEXT
    )`);

    db.run(`CREATE TABLE demand_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        projected_demand INTEGER,
        variables TEXT
    )`);
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Gestión de Vehículos y Equipos de Uber');
});

// Rutas para Vehículos
app.get('/vehicles', (req, res) => {
    db.all('SELECT * FROM vehicles', (err, rows) => {
        if (err) throw err;
        res.json(rows);
    });
});

app.post('/vehicles', (req, res) => {
    const { model, year, status, current_location, maintenance_history } = req.body;
    db.run('INSERT INTO vehicles (model, year, status, current_location, maintenance_history) VALUES (?, ?, ?, ?, ?)',
        [model, year, status, current_location, JSON.stringify(maintenance_history)],
        function(err) {
            if (err) throw err;
            res.json({ id: this.lastID });
        });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});