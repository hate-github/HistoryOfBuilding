const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Разрешаем обслуживание статических файлов из этих папок
app.use(express.static(path.join(__dirname)));
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Make sure your models are in the "models" folder');
});