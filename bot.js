//localStorage['learnedThings'] = [];
//localStorage['annoyingUsers'] = [];

const main = document.getElementById('chat');
const messageIds = [];
const learnedThings = JSON.parse(localStorage['learnedThings'] != '' ? localStorage['learnedThings'] : '[]');
const joinedRooms = [];
const voteCastRoom = [];
const annoyingUsers = JSON.parse(localStorage['annoyingUsers'] != '' ? localStorage['annoyingUsers'] : '[]');
const MAX_VOTE_FOR_ROOM = 3;

const DO_YOU_EVEN_MATH = 'https://i.imgur.com/UBoD276.png';
const DUMB_FUCK_JUICE = 'https://i.kym-cdn.com/entries/icons/original/000/027/642/dumb.jpg';
const WAT = 'https://i.kym-cdn.com/photos/images/newsfeed/001/260/099/be0.png';
const PING_TRIGGER = 'PatrickStar';

const messageQueue = [];

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function dequeueMessages() {
	while (true) {
		var message = messageQueue.shift();
		if (message !== undefined) {
			say(message);
		}
		await sleep(2000);
	}
}

function enqueueMessage(message) {
	messageQueue.push(message);
}

function onNodeAppend(e) {
    var usernameContainer = $(e.path).filter('.monologue').find('.signature .username')[0];
    var userId = $(e.path).filter('.monologue').find('.signature').get(-1);
    var messages = $(e.path).filter('.monologue .messages')[0];
    var content = $(messages).find('.message .content').get(-1);

    var idContainer = $(messages).find('.message').get(-1);
    var attr = $(idContainer).attr('id');
    if (attr == null) return;
    var parts = attr.split('-');
    var id = parts[1];

    if (parts[0] == 'pending') return;

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

    if (message.includes(PING_TRIGGER)) {
    	message = message.replace(PING_TRIGGER, '').trim();
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
    			enqueueMessageenqueueMessage("I don't think I would like that");
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
    			enqueueMessage(`[listen here you lil sh...](https://texttospeech.responsivevoice.org/v1/text:synthesize?text=${message}&lang=ar&engine=g3&name=&pitch=0.5&rate=0.5&volume=1&key=PL3QYYuV&gender=male)`);
    		}
    		else {
    			enqueueMessage(DUMB_FUCK_JUICE);
    		}
    	}
    	else {
    		var parts = message.split(/ (.+)/).filter(e => e != null && e != '');
    		if (parts.length > 0) {
    			var key = parts[0];
    			if (learnedThings[key] != null) {
    				enqueueMessage(learnedThings[key]);
    			}
    			else {
    				enqueueMessage(toRandomCase(message) + ' 🙄');
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
	$('#input').val(message);
	$('#sayit-button').click();
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
