var main = document.getElementById('chat');
var messageIds = [];
var learnedThings = JSON.parse(localStorage['learnedThings'] != '' ? localStorage['learnedThings'] : '[]');
var joinedRooms = [];
var voteCastRoom = [];
var annoyingUsers = JSON.parse(localStorage['annoyingUsers'] != '' ? localStorage['annoyingUsers'] : '[]');
var MAX_VOTE_FOR_ROOM = 3;

var DO_YOU_EVEN_MATH = 'https://i.imgur.com/UBoD276.png';
var DUMB_FUCK_JIUCE = 'https://i.kym-cdn.com/entries/icons/original/000/027/642/dumb.jpg';

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
 		say('hur durr');
 	}
 	
	if (message.includes('stop')) {
		say(`@${displayName} hammer time!`);
	}

    if (message.startsWith('@Patrick')) {
    	message = message.replace('@Patrick', '').trim();
    	if (message.startsWith('say')) {
    		var reply = message.replace('say', '').trim();
    		say(reply);
    	}
    	else if (message.startsWith('eval')) {
    		message = message.replace('eval', '').trim();
    		if (message.includes('window.') || message.includes('document.')) {
    			say("I don't think I would like that");
    		}
    		else {
	    		var result = eval(message);
	    		say(result);
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
    			console.log(learnedThings);
    			say(`@${displayName} did you really teach me to say ${key}? I learned it the hard way`);
    		}
    		else {
    			say('what am I suppose to learn?');
    		}
    	}
    	else if (message.startsWith('join')) {
    		message = message.replace('join', '').trim();
    		var roomNumber = tryParseInt(message);
    		if (roomNumber >= 0) {
    			voteCastRoom[userId] = roomNumber;
				var voteCount = voteCastRoom.filter(e => e == roomNumber).length;
    			if (voteCount >= MAX_VOTE_FOR_ROOM) {
    				say("I'm joining the kids room " + roomNumber);
    				window.open(`https://chat.stackoverflow.com/rooms/${roomNumber}`);
    				voteCastRoom = [];
    			}
    			else {
    				say(`:${messageId} I'm going to join the children's room ${roomNumber}. I just need ${MAX_VOTE_FOR_ROOM - voteCount} more votes.`);
    			}
    		}
    		else {
    			say(DO_YOU_EVEN_MATH);
    		}
    	}
    	else if (message == 'list annoying users') {
    		var reply = '';
    		for(var i in annoyingUsers) {
				var name = i;
				var score = annoyingUsers[i] != null ? Object.keys(annoyingUsers[i]).length : 0;
				reply += `name: ${name}, score: ${score}\n`;
			}
			console.log(annoyingUsers);
    		if (reply != '') {
    			say(reply);
    		}
    		else {
    			say('This room are filled with Angels');
    		}
		}
    	else if (message.startsWith('vote annoying user')) {
    		message = message.replace('vote annoying user', '').trim();
    		var user = message;
    		if (user.length > 0) {
	    		annoyingUsers[user] = annoyingUsers[user] || [];
	    		annoyingUsers[user][userId] = 1;
    			localStorage['annoyingUsers'] = JSON.stringify(annoyingUsers);
    			say(`@${user} ${displayName} voted you as annoying user.`);
    		}
    		else {
    			say(DUMB_FUCK_JIUCE);
    		}
    	}
    	else {
    		var parts = message.split(/ (.+)/).filter(e => e != null && e != '');
    		if (parts.length > 0) {
    			var key = parts[0];
    			if (learnedThings[key] != null) {
    				say(learnedThings[key]);
    			}
    			else {
    				say("Ughh...");
    			}
    		}
    		else {
    			say("I don't know what you said but it sounds delicious.");
    		}
    	}
    }
    console.log('userId: ' + userId);
    console.log('messageId: ' + messageId);
    console.log('message: ' + message);
    console.log('displayName: ' + displayName);
}

main.addEventListener("DOMNodeInserted", onNodeAppend);

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
			message += `[${$(e).text()}](${href})`;
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
