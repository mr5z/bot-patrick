/*
 * Created by https://stackoverflow.com/users/2304737
 *
 *
 */

const main = document.getElementById('chat');
const learnedThings = JSON.parse((localStorage['learnedThings'] !== undefined && localStorage['learnedThings'] != '') ? localStorage['learnedThings'] : '[]');
const annoyingUsers = JSON.parse((localStorage['annoyingUsers'] !== undefined && localStorage['annoyingUsers'] != '') ? localStorage['annoyingUsers'] : '[]');
const joinedRooms = [];
const voteCastRoom = [];

const MAX_VOTE_FOR_ROOM = 3;
const DO_YOU_EVEN_MATH = 'https://i.imgur.com/UBoD276.png';
const DUMB_FUCK_JUICE = 'https://i.kym-cdn.com/entries/icons/original/000/027/642/dumb.jpg';
const WAT = 'https://i.kym-cdn.com/photos/images/newsfeed/001/260/099/be0.png';
const FOUR_O_FOUR = 'https://img.pngio.com/patrick-one-tooth-laugh-animated-gif-gifs-gifsoupcom-little-patrick-star-one-tooth-320_240.gif';
const FRIDAY = 'https://pbs.twimg.com/media/DDkl-SmXcAYlFnn.jpg';
const PING_TRIGGERS = ['PatrickStar', 'p3k'];

const messageQueue = [];

var messageIds = [];
var lastMessage = '';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dequeueMessages() {
    while (true) {
        var message = messageQueue.shift();
        if (message !== undefined) {
            say(message);
        }
        await sleep(3000);
    }
}

function enqueueMessage(message) {
    messageQueue.push(message);
}

async function onNodeAppend(e) {
    var usernameContainer = $(e.path).filter('.monologue').find('.signature .username')[0];
    var userId = $(e.path).filter('.monologue').find('.signature').get(-1);
    var messages = $(e.path).filter('.monologue .messages')[0];
    var content = $(messages).find('.message .content').get(-1);

    var idContainer = $(messages).find('.message').get(-1);
    var attr = $(idContainer).attr('id');
    if (attr == null) return;
    var parts = attr.split('-');
    var id = parts[1];

    if (parts[0] == 'pending') {
        var retryContainer = $(content).next();
        var retryIn = $(retryContainer).text().match(/(?!You can perform this action again in )[0-9]+(?= second(s*)\.)/);
        if (retryIn != null) {
            retryIn = retryIn[0];
            setTimeout(() => {
                $(retryContainer).children()[0].click();
            }, (retryIn + 1) * 1000);
        }
        return;
    }

    var messageId = attr.split('-')[1];

    if (messageIds[messageId] != null)
        return;

    if (messageIds.length > 100)
        messageIds = [];

    messageIds[messageId] = messageId;

    var message = getMessage(content);
    var paths = $(userId).attr('href').split('/');
    var userId = $(paths).get(-1);
    var displayName = usernameContainer.innerText;

    if (userId == '12252511')
        return;

    if (userId == '-2') {
        if (Math.random() > 0.3)
            enqueueMessage(`:${messageId} shut up`);
        else
            enqueueMessage('hurr durr');
    }
    
    if (message.includes('stop')) {
        enqueueMessage(`@${displayName.replaceAll(' ', '')} hammer time!`);
    }

    if (PING_TRIGGERS.findIndex(s => message.indexOf(s) > -1) > - 1) {
        for(var i = 0;i < PING_TRIGGERS.length; ++i) {
            message = message.replace(PING_TRIGGERS[i], '').trim();
        }
        if (message.startsWith('say')) {
            var reply = message.replace('say', '').trim();
            enqueueMessage(reply);
        }
        else if (message.startsWith('eval')) {
            message = message.replace('eval', '').trim();
            if (message.includes('while') ||
                message.includes('if') ||
                message.includes('function') ||
                message.includes('})()')) {
                enqueueMessage("I don't think I would like that");
            }
            else {
                try {
                    var result = eval('"use strict";' + message);
                    if (result != null || result != undefined || result != '')
                        enqueueMessage(result);
                    else
                        enqueueMessage(WAT);
                }
                catch (ex) {
                    enqueueMessage('hurr durr error');
                }
            }
        }
        else if (message.startsWith('learn')) {
            message = message.replace('learn', '').trim();
            var parts = message.split(/ (.+)/).filter(e => e != null && e != '');
            if (parts.length >= 2) {
                var key = parts[0];
                var value = parts[1];
                learnedThings[key] = value;
                localStorage['learnedThings'] = JSON.stringify(learnedThings);
                enqueueMessage(`:${messageId} learnedth ${key}`);
            }
            else {
                enqueueMessage('what am I suppose to learn?');
            }
        }
        else if (message.startsWith('join')) {
            message = message.replace('join', '').trim();
            var roomNumber = tryParseInt(message);
            if (roomNumber >= 0) {
                voteCastRoom[userId] = roomNumber;
                var voteCount = voteCastRoom.filter(e => e == roomNumber).length;
                if (voteCount >= MAX_VOTE_FOR_ROOM) {
                    enqueueMessage("I'm joining the kids room " + roomNumber);
                    window.open(`https://chat.stackoverflow.com/rooms/${roomNumber}`);
                    voteCastRoom = [];
                }
                else {
                    enqueueMessage(`:${messageId} I'm going to join the children's room ${roomNumber}. I just need ${MAX_VOTE_FOR_ROOM - voteCount} more votes.`);
                }
            }
            else {
                enqueueMessage(DO_YOU_EVEN_MATH);
            }
        }
        else if (message == 'list annoying users') {
            var reply = '';
            for(var i in annoyingUsers) {
                var name = i;
                var score = annoyingUsers[i] != null ? Object.keys(annoyingUsers[i]).length : 0;
                reply += `name: ${name}, score: ${score}\n`;
            }
            if (reply != '') {
                enqueueMessage(reply);
            }
            else {
                enqueueMessage('This room is filthy');
            }
        }
        else if (message.startsWith('vote annoying user')) {
            message = message.replace('vote annoying user', '').trim();
            var user = message;
            if (user.length > 0) {
                annoyingUsers[user] = annoyingUsers[user] || [];
                annoyingUsers[user][userId] = 1;
                localStorage['annoyingUsers'] = JSON.stringify(annoyingUsers);
                enqueueMessage(`@${user.replaceAll(' ', '')} ${displayName} voted you as annoying user.`);
            }
            else {
                enqueueMessage(DUMB_FUCK_JUICE);
            }
        }
        else if (message.startsWith('speak')) {
            message = message.replace('speak', '').trim();
            if (message.length > 0) {
                message = encodeURIComponent(message);
                enqueueMessage(`[listen here you lil sh...](https://texttospeech.responsivevoice.org/v1/text:synthesize?text=${message}&lang=j&engine=g3&name=&pitch=0.5&rate=0.5&volume=1&key=PL3QYYuV&gender=female)`);
            }
            else {
                enqueueMessage(DUMB_FUCK_JUICE);
            }
        }
        else if (message.startsWith('acronym')) {
            message = message.replace('acronym', '').trim();

            const settings = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=get_ac&term=${encodeURIComponent(message)}`
            };
            try {
                const response = await fetch('https://www.abbreviations.com/gw.php', settings);
                const data = await response.json();
                if (data.length > 0) {
                    var firstEntry = data[Math.random() * data.length | 0];
                    enqueueMessage(`${firstEntry.term}: ${firstEntry.desc}`);
                }
                else {
                    enqueueMessage(FOUR_O_FOUR);
                }
            } catch (e) {
                console.log(e);
                enqueueMessage(FOUR_O_FOUR);
            }
        }
        else if (message.startsWith('mimi')) {
            message = message.replace('mimi', '').trim();
            const params = message.match(/\w+|"[^"]+"/g);
            const text0 = params[0]?.replace(/^\"+|\"+$/g, '').replace(/^\'+|\'+$/g, '');
            const text1 = params[1]?.replace(/^\"+|\"+$/g, '').replace(/^\'+|\'+$/g, '');
            try {
                const memeResponse = await fetch('https://api.imgflip.com/get_memes');
                const data = await memeResponse.json();
                const memes = data.data.memes;
                const entry = memes[Math.random() * memes.length | 0];
                const settings = {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `template_id=${entry.id}&username=PatrickBot&password=8WaHj#x3Aq1xy*7qn&text0=${text0}&text1=${text1}`
                };
                const captionResponse = await fetch('https://api.imgflip.com/caption_image', settings);
                const captionData = await captionResponse.json();
                if (captionData != null) {
                    enqueueMessage(captionData.data.url);
                }
                else {
                    enqueueMessage(FOUR_O_FOUR);
                }
            } catch (e) {
                console.log(e);
                enqueueMessage(FOUR_O_FOUR);
            }
        }
        else if (message.startsWith('friday')) {
        	enqueueMessage(FRIDAY);
        }
        else if (message.startsWith('dota')) {
            message = message.replace('dota', '').trim();
            var audioToPlay = null;
            for(var i = 0;i < audios.length; ++i) {
                const url = audios[i];
                if (url.lastIndexOf('/') < 0)
                    continue;

                const tempName = url
                    .substring(url.lastIndexOf('/') + 1)
                    .replace('.mp3', '')
                    .replaceAll('_', ' ');

                if (tempName.toLowerCase().includes(message.toLowerCase())) {
                    audioToPlay = url;
                    break;
                }
            }
            if (audioToPlay != null)
                enqueueMessage(`[${message}](${audioToPlay})`);
            else
                enqueueMessage(`[${message}](https://www.youtube.com/watch?v=oHg5SJYRHA0)`);
        }
        else {
            var parts = message.split(/ (.+)/).filter(e => e != null && e != '');
            if (parts.length > 0) {
                var key = parts[0];
                if (learnedThings[key] != null) {
                    enqueueMessage(learnedThings[key]);
                }
                else {
                    enqueueMessage(toRandomCase(message));
                }
            }
            else {
                enqueueMessage("huh?");
            }
        }
    }
    // console.log('userId: ' + userId);
    // console.log('messageId: ' + messageId);
    // console.log('message: ' + message);
    // console.log('displayName: ' + displayName);
}

main.addEventListener("DOMNodeInserted", onNodeAppend);

dequeueMessages();

function toRandomCase(text) {
    if (text == null|| text == undefined)
        return text;

    var newText = '';
    for(var i = 0;i < text.length; ++i) {
        newText += i % 2 != 0 ? text[i].toUpperCase() : text[i].toLowerCase();
    }
    return newText;
}

function say(message) {
    if (lastMessage == message) {
        message += new Array(Math.random() * 5 | 0).fill('.').join('');
    }
    $('#input').val(message);
    $('#sayit-button').click();
    lastMessage = message;
}

function getMessage(content) {

    var link = $(content).find('.ob-post-title a').attr('href');
    if (link != null && link != '') {
        return link;
    }

    var message = '';
    var children = content.childNodes;
    for(var i = 0;i < children.length; ++i) {
        var e = children[i];

        var href = $(e).attr('href');

        if (href != null) {
            message += href; // `[${$(e).text()}](${href})`;
        }
        else {
            message += $(e).text();
        }
    }
    return message;
}

function tryParseInt(str) {
    try {
        return parseInt(str);
    }
    catch (ex) {
        return -1;
    }
}

(function(){
    // Convert array to object
    var convArrToObj = function(array){
        var thisEleObj = new Object();
        if(typeof array == "object"){
            for(var i in array){
                var thisEle = convArrToObj(array[i]);
                thisEleObj[i] = thisEle;
            }
        }else {
            thisEleObj = array;
        }
        return thisEleObj;
    };
    var oldJSONStringify = JSON.stringify;
    JSON.stringify = function(input){
        if(oldJSONStringify(input) == '[]')
            return oldJSONStringify(convArrToObj(input));
        else
            return oldJSONStringify(input);
    };
})();


function safeEval(code) {
    // create our own local versions of window and document with limited functionality
    var locals = {
        window: {
        },
        document: {
        }
    };

    var that = Object.create(null); // create our own this object for the user code
    createSandbox(code, that, locals)(); // create a sandbox

    function createSandbox(code, that, locals) {
        var params = []; // the names of local variables
        var args = []; // the local variables

        for (var param in locals) {
            if (locals.hasOwnProperty(param)) {
                args.push(locals[param]);
                params.push(param);
            }
        }

        var context = Array.prototype.concat.call(that, params, code); // create the parameter list for the sandbox
        var sandbox = new (Function.prototype.bind.apply(Function, context)); // create the sandbox function
        context = Array.prototype.concat.call(that, args); // create the argument list for the sandbox

        return Function.prototype.bind.apply(sandbox, context); // bind the local variables to the sandbox
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const audios =
["https://gamepedia.cursecdn.com/dota2_gamepedia/5/5c/Chat_wheel_2017_all_dead.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d7/Chat_wheel_2017_ay_ay_ay.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/1e/Chat_wheel_2017_bozhe_ti_posmotri.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/88/Chat_wheel_2017_brutal.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/82/Chat_wheel_2017_charge.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/2/2f/Chat_wheel_2017_crash_burn.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/8c/Chat_wheel_2017_cricket.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/2/21/Chat_wheel_2017_crybaby.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/48/Chat_wheel_2017_disastah.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/9/97/Chat_wheel_2017_drum_roll.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/4d/Chat_wheel_2017_ehto_g_g.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/9/95/Chat_wheel_2017_eto_prosto_netchto.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/5/52/Chat_wheel_2017_frog.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/5/5f/Chat_wheel_2017_headshake.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/6/6c/Chat_wheel_2017_jia_you.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/b/b6/Chat_wheel_2017_patience.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/3/39/Chat_wheel_2017_po_liang_lu.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/9/99/Chat_wheel_2017_rimshot.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/3/3c/Chat_wheel_2017_sad_bone.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/7/76/Chat_wheel_2017_sproing.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/5/51/Chat_wheel_2017_tian_huo.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/0/04/Chat_wheel_2017_wan_bu_liao_la.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/b/b7/Chat_wheel_2017_wow.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/0/08/Chat_wheel_2017_zhil_do_konsta.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/0/0f/Chat_wheel_2017_zou_hao_bu_song.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/86/Chat_wheel_2018_bockbock.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/5/55/Chat_wheel_2018_bozhe_kak_eto_bolno.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d9/Chat_wheel_2018_duiyou_ne.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/13/Chat_wheel_2018_easiest_money.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/7/73/Chat_wheel_2018_echo_slama_jama.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/fc/Chat_wheel_2018_eto_nenormalno.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d2/Chat_wheel_2018_eto_sochno.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/f7/Chat_wheel_2018_gao_fu_shuai.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/c/c0/Chat_wheel_2018_hu_lu_wa.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/47/Chat_wheel_2018_kiss.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/fd/Chat_wheel_2018_krasavchik.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/0/03/Chat_wheel_2018_liu_liu_liu.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/6/60/Chat_wheel_2018_next_level.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/fd/Chat_wheel_2018_ni_qi_bu_qi.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/3/32/Chat_wheel_2018_oh_my_lord.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/86/Chat_wheel_2018_ow.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/3/34/Chat_wheel_2018_oy_oy_bezhat.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/4c/Chat_wheel_2018_oy_oy_oy.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/6/65/Chat_wheel_2018_party_horn.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/c/c7/Chat_wheel_2018_playing_to_win.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/49/Chat_wheel_2018_snore.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/b/bb/Chat_wheel_2018_ta_daaaa.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/a/ab/Chat_wheel_2018_that_was_questionable.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/fd/Chat_wheel_2018_what_just_happened.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/2/2e/Chat_wheel_2018_yahoo.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/c/c0/Chat_wheel_2018_youre_a_hero.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/88/Chat_wheel_2019_absolutely_perfect.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/fb/Chat_wheel_2019_bai_tuo_shei_qu.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/c/cf/Chat_wheel_2019_ceeeb_start.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/8c/Chat_wheel_2019_ceeeb_stop.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/10/Chat_wheel_2019_da_da_da_nyet.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/9/9d/Chat_wheel_2019_ding_ding_ding.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/ff/Chat_wheel_2019_eto_ge_popayx_feeda.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/19/Chat_wheel_2019_eughahaha.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d5/Chat_wheel_2019_gan_ma_ne_xiong_di.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d5/Chat_wheel_2019_glados_chat_01.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/a/ac/Chat_wheel_2019_glados_chat_04.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/14/Chat_wheel_2019_glados_chat_07.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/f4/Chat_wheel_2019_glados_chat_21.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/2/28/Chat_wheel_2019_goodness_gracious.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/b/b4/Chat_wheel_2019_kak_boyge_te_byechenya.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/8d/Chat_wheel_2019_kor_immortality.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/41/Chat_wheel_2019_kor_million_dollar_house.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d3/Chat_wheel_2019_kor_roshan.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/0/01/Chat_wheel_2019_kor_scan.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/7/7b/Chat_wheel_2019_kor_yes_no.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/0/03/Chat_wheel_2019_kor_yolo.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/2/21/Chat_wheel_2019_kreasa_kreasa.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/f9/Chat_wheel_2019_lets_play.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/a/a3/Chat_wheel_2019_lian_dou_xiu_wai_la.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/49/Chat_wheel_2019_looking_spicy.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/82/Chat_wheel_2019_nakupuuu.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d1/Chat_wheel_2019_no_chill.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/5/57/Chat_wheel_2019_piao_liang.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/15/Chat_wheel_2019_ti9_crowd_groan.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d1/Chat_wheel_2019_ti9_head_bonk.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/f9/Chat_wheel_2019_ti9_kooka_laugh.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/e/e7/Chat_wheel_2019_ti9_monkey_biz.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/6/69/Chat_wheel_2019_ti9_orangutan_kiss.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/f/f8/Chat_wheel_2019_ti9_record_scratch.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/c/c5/Chat_wheel_2019_ti9_skeeter.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/a/a3/Chat_wheel_2019_ti9_ta_da.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/6/61/Chat_wheel_2019_whats_cooking.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/5/55/Chat_wheel_2019_wot_eto_bru.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/49/Chat_wheel_2019_zai_jian_le_bao_bei.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d5/Chat_wheel_frostivus_2018_champagne_celebration.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/1a/Chat_wheel_frostivus_2018_frostivus_magic.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/a/af/Chat_wheel_frostivus_2018_greevil_laugh01.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/1/12/Chat_wheel_frostivus_2018_greevil_laugh02.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/2/21/Chat_wheel_frostivus_2018_greevil_laugh03.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/c/cd/Chat_wheel_frostivus_2018_greevil_laugh04.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/dc/Chat_wheel_frostivus_2018_greevil_laugh05.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/4/4e/Chat_wheel_frostivus_2018_greevil_laugh06.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/0/04/Chat_wheel_frostivus_2018_greevil_laugh07.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/d/d6/Chat_wheel_frostivus_2018_sleighbells.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/6/63/Chat_wheel_new_bloom_2019_ny_drums.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/88/Chat_wheel_new_bloom_2019_ny_gong.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/6/6a/Chat_wheel_new_bloom_2019_ny_pig_snort.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/8/84/Crowd_1.mp3","https://gamepedia.cursecdn.com/dota2_gamepedia/c/c1/Crowd_2.mp3"];
