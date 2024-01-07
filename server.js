const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require("axios");

const app = express();
const port = 3000;

const endpoint =
    "https://us-central1-chat-for-chatgpt.cloudfunctions.net/basicUserRequestBeta";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const notesDir = 'notes/';

if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir);
}

app.get('/create', (req, res) => {
    res.render('create');
});

// Новый маршрут для обработки создания новой заметки
app.post('/create', (req, res) => {
    const title = req.body.title || 'new_note';
    const filePath = `${notesDir}${title}.html`;

    // Создание новой заметки
    fs.writeFileSync(filePath, '<p></p>');

    res.redirect('/');
});


app.get('/edit/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = `${notesDir}${fileName}`;
    const content = fs.readFileSync(filePath, 'utf-8');

    res.render('edit', { fileName, content });
});

app.post('/edit/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = `${notesDir}${fileName}`;
    const content = req.body.content;

    fs.writeFileSync(filePath, content);

    res.redirect('/');
});

// Новый маршрут для генерации текста
app.post('/generate-text', async (req, res) => {
    // Фиктивный API для генерации текста
    const task = req.body.task || 'Default task';

    try {
        const response = await axios.post(
            endpoint,
            {
                data: {
                    message:
                        'Продолжите текст, используя HTML знаки для изменения шрифтов, цветов, и т.д., ваша цель: "' + task.split('$')[0] + '". Вот этот текст: ' + task.split('$')[1],
                },
            },
            {
                headers: {
                    Host: 'us-central1-chat-for-chatgpt.cloudfunctions.net',
                    Connection: 'keep-alive',
                    Accept: '*/*',
                    'User-Agent': 'com.tappz.aichat/1.2.2 iPhone/16.3.1 hw/iPhone12_5',
                    'Accept-Language': 'en',
                    'Content-Type': 'application/json; charset=UTF-8',
                },
            }
        );

        const result = response.data.result.choices[0].text;
        console.log(result);
        const generatedText = result;

        res.json({ generatedText });
    } catch (error) {
        console.error('Ошибка:', error);
    }


});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
