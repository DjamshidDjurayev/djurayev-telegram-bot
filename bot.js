/**
 * Created by dzhuraev on 7/6/16.
 */
var TelegramBot = require('node-telegram-bot-api');
var bot;
var token = '187926574:AAFhSmhpPxpggGXfn616Hb1M22EMIxFoAEc';
var fs = require('fs');
var ownerChatId = 8966805; //replace this with your chat id noted previously
var options = {
  webHook: {
    port: 443}
};
  bot = new TelegramBot(token, options);
  bot.setWebHook('https://dry-earth-86943.herokuapp.com/' + token);

console.log('bot server started...');

var baseUrl = "https://timespot.herokuapp.com";
var request = require('request'), zlib = require('zlib');
var headers = {
    'Accept-Encoding': 'gzip'
};
var listOfObjects;
var chatId;
var messageText;
var name;
var lastName;
var options;
var mainButtonArray = [];
var listOfStrings = [];


bot.on('message', function (msg) {
    switch (msg.text) {
        case "/start":
            startFunction(msg);
            break;
        case "/end":
            finishFunction();
            break;
        case "Сотрудники":
            getStaffList()
            break;
        case "Новости":
            getNewsList()
            break;
        case "Статистика":
            getStatisticsList()
            break;
        default:
            bot.sendMessage(msg.chat.id, "no such command");
            break;
    }
});

//bot.on('command', function (msg){
//    console.log(JSON.stringify(msg));
//});


function startFunction(msg) {
    chatId = msg.chat.id;
    messageText = msg.message_id;
    name = msg.chat.first_name;
    last_name = msg.chat.last_name
    fillList();
    showKeyboardButtons(listOfStrings, "Что вас интересует?")
}


function finishFunction() {
    //do some stuff
}

function showKeyboardButtons(arrayList, showText) {
    for(var i = 0; i < arrayList.length; i++) {
        var tempButtonArray = [];
        tempButtonArray[0] = getJSONObject(arrayList[i], i);
        mainButtonArray[i] = tempButtonArray;
    }
    options = {
        reply_markup: JSON.stringify({
            keyboard: mainButtonArray,
            one_time_keyboard: true
        })
    };
    bot.sendMessage(chatId, showText ,options);
}

bot.on('callback_query', function (msg) {
    var id = msg.from.id;
    var messageText = msg.data;
    console.log(msg.data);

    getStaffList();

    //switch (id) {
    //    case 0:
    //        getStaffList();
    //        break;
    //    case 1:
    //        getNewsList();
    //        break;
    //    case 2:
    //        getStatisticsList();
    //        break;
    //}
    //bot.sendMessage(msg.from.id, "You clicked button with data '" + data + "'");
});

function showInlineKeyboardButtons() {

}

function getJSONObject(textString, index) {
    var object = {
        text: textString,
        callback_data: index
    };
    return object;
}

function fillList() {
    listOfStrings[0] = "Сотрудники";
    listOfStrings[1] = "Новости";
    listOfStrings[2] = "Статистика";
}

function getStaffList() {
    request({
            method: 'GET',
            uri: baseUrl + '/api/persons',
            gzip: true
        },
        function (error, response, body) {
            console.log('error: ' + response.statusCode);
            listOfObjects = JSON.parse(body);
            console.log(listOfObjects.length);
            bot.sendMessage(chatId, generateUserTableFormat(listOfObjects));
        })
}

function getNewsList() {
    request({
            method: 'GET',
            uri: baseUrl + '/api/news',
            gzip: true
        },
        function (error, response, body) {
            console.log('error: ' + response.statusCode);
            listOfObjects = JSON.parse(body);
            console.log(listOfObjects.length);
            bot.sendMessage(chatId, generateNewsTableFormat(listOfObjects));
        })
}

function getStatisticsList() {
    request({
            method: 'GET',
            uri: baseUrl + '/api/getStatistics?login=djamik123&password=djamik123',
            gzip: true
        },
        function (error, response, body) {
            console.log('error: ' + response.statusCode);
            object = JSON.parse(body);
            bot.sendMessage(chatId, generateStatisticsTableFormat(object));
        })
}

function generateUserTableFormat(list) {
    var userTable = 'USERS:\n';
    for(var i = 0; i < list.length; i++) {
        userTable += (i + 1 + '. ') + list[i]['surname'] + ' ' + list[i]['name'] + ';\n'
    }

    return userTable;
}

function generateNewsTableFormat(list) {
    var newsTable = 'News:\n';
    for(var i = 0; i < list.length; i++) {
        newsTable += (i + 1 + '. ') + list[i]['title'] + ' ' + list[i]['description'] + ';\n'
    }

    return newsTable;
}

function generateStatisticsTableFormat(object) {
    var statsTable = 'STATISTICS:\n';
    statsTable += (1 + '. Staff count: ') + object.staff_count + ';\n'
    statsTable += (2 + '. History incomings: ') + object.history_count + ';\n'
    statsTable += (3 + '. News count: ') + object.news_count + ';\n'
    statsTable += (4 + '. Admins count: ') + object.admin_count + ';\n'
    statsTable += (5 + '. Positions count: ') + object.position_count + ';\n'

    return statsTable;
}
// inline_keyboard - > buttons below messages
// keyboard - > buttons below edit text field



