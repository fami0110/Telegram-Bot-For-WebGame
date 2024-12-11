const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const apiToken = process.env.API_TOKEN;
const gameShortName = process.env.GAME_SHORT_NAME;
const gameUrl = process.env.GAME_URL;
const port = process.env.PORT || 5000;
// console.log({apiToken, gameShortName, gameUrl, port});

const server = express();
const bot = new TelegramBot(apiToken, { polling: true });
const queries = {};

// Serve static files
server.use(express.static(path.join(__dirname, gameShortName)));
server.use(express.json());

// Start command - display description and options
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 
`🎮 Welcome to *${gameShortName.replace('_', ' ')}* Bot!\n
Here are the commands you can use:
- /game : Play the game.
- /help : Get help.
- /credits : View credits.\n
Tap the buttons below to start!`, {
        parse_mode: "Markdown",
        reply_markup: {
            keyboard: [
                [{ text: "🎮 Play Game" }],
                [{ text: "📜 Credits" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

// Help command
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "Say /game to play the game or /credits to view credits.");
});

// Credits button or command
bot.onText(/\/credits!📜 Credits/, (msg) => {
    bot.sendMessage(msg.chat.id, 
`👾 *Credits:*\n
Game developed by:\n- ZhayaGT (on github)`, {
        parse_mode: "Markdown"
    });
});

// Play game command or button
bot.onText(/\/game|🎮 Play Game/, (msg) => {
    bot.sendGame(msg.chat.id, gameShortName);
});

// Callback for game URL
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameShortName) {
        bot.answerCallbackQuery(query.id, `Sorry, '${query.game_short_name}' is not available.`);
    } else {
        queries[query.id] = query;
        bot.answerCallbackQuery(query.id, {url: gameUrl})
    }
});

// Inline query handler
bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameShortName
    }]);
});

server.get("/", (req, res) => {
    res.status(200);
    res.send({
        status: 200,
        message: 'success',
    });
});

// High score endpoint
// server.get("/highscore/:score", function (req, res, next) {
//     if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
//     let query = queries[req.query.id];
//     let options;
//     if (query.message) {
//         options = {
//             chat_id: query.message.chat.id,
//             message_id: query.message.message_id
//         };
//     } else {
//         options = {
//             inline_message_id: query.inline_message_id
//         };
//     }
//     bot.setGameScore(query.from.id, parseInt(req.params.score), options,
//         function (err, result) {});
// });

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});