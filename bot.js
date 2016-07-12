/**
 * Created by dzhuraev on 7/6/16.
 */
var TelegramBot = require('node-telegram-bot-api');
var token = '187926574:AAFhSmhpPxpggGXfn616Hb1M22EMIxFoAEc';
var fs = require('fs');
var ownerChatId = 8966805; //replace this with your chat id noted previously
var bot = new TelegramBot(token, {polling: true});
var baseUrl = "https://timespot.herokuapp.com";
var request = require('request'), zlib = require('zlib');
var headers = {
    'Accept-Encoding': 'gzip'
};
var listOfObjects;
var messageText;
var name;
var lastName;
var options;
var mainButtonArray = [];
var listOfStrings = [];
var fromChatId;
var toChatId;

sbot.on('message', function (msg) {
fromChatId = msg.from.id;
toChatId = msg.chat.id;
switch (msg.text) {
    case "/start":
        startBot();
        break;
    case "/end":
        finishBot();
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
    case "Получить свои фото":
        getUserPhotos()
        break;
    default:
        bot.sendMessage(msg.chat.id, "no such command");
        break;
}
});

//bot.on('command', function (msg){
//    console.log(JSON.stringify(msg));
//});


function startBot() {
    fillList();
    showKeyboardButtons(listOfStrings, "Что вас интересует?")
}

function finishBot() {
    //do some stuff
}

function showKeyboardButtons(arrayList, showText) {
    for (var i = 0; i < arrayList.length; i++) {
        var tempButtonArray = [];
        tempButtonArray[0] = getJSONObject(arrayList[i], i);
        mainButtonArray[i] = tempButtonArray;
    }
    options = {
        reply_markup: JSON.stringify({
            keyboard: [
                [{ text: 'Some button text 1', callback_data: '1' }],
                [{ text: 'Some button text 2', callback_data: '2' }],
                [{ text: 'Some button text 3', callback_data: '3' }]
            ],
            one_time_keyboard: true
        })
    };
    bot.sendMessage(toChatId, showText, options);
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
    listOfStrings[3] = "Получить свои фото";
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
            bot.sendMessage(toChatId, generateUserTableFormat(listOfObjects));
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
            bot.sendMessage(toChatId, generateNewsTableFormat(listOfObjects));
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
            bot.sendMessage(toChatId, generateStatisticsTableFormat(object));
        })
}

function generateUserTableFormat(list) {
    var userTable = 'USERS:\n';
    for (var i = 0; i < list.length; i++) {
        userTable += (i + 1 + '. ') + list[i]['surname'] + ' ' + list[i]['name'] + ';\n'
    }

    return userTable;
}

function generateNewsTableFormat(list) {
    var newsTable = 'News:\n';
    for (var i = 0; i < list.length; i++) {
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

function getUserPhotos() {
    bot.getUserProfilePhotos(fromChatId)
        .then(function (resolve, reject) {
            if (resolve != undefined) {
                var object = JSON.parse(JSON.stringify(resolve));
                var photoList = object.photos;
                //console.log(photoList[0][0]["file_id"]);
                if (photoList.length != 0) {
                    for (var i = 0; i < photoList.length; i++) {
                        bot.sendPhoto(toChatId, photoList[i][0]["file_id"]);
                    }
                } else {
                    bot.sendMessage(toChatId, "No photo found");
                }
            } else if (reject != undefined) {
                console.log(JSON.stringify(reject));
            }
        });
}
// inline_keyboard - > buttons below messages
// keyboard - > buttons below edit text field



