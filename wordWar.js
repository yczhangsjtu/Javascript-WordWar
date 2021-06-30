/**
 *  file wordWar.js
 *  brief contains all the global variables to be used in the game and event handlers
 */

//HTML DOM elements
var txtCommand = document.getElementById("command"); //tag <p> to displaying command
var cvs = document.getElementById("display"); //Canvas to display the game

//Numbers
var fieldHeight = 60;
var fieldWidth = 90;
var panelWidth = 180;
var screenMarginX = 50;
var screenMarginY = 120;
var screenWidth = cvs.width - panelWidth;
var screenHeight = cvs.height;

//Keys
var KEY_SPACE = 32;
var KEY_A = 65;
var KEY_Z = 90;
var KEY_ENTER = 13;
var KEY_BACKSPACE = 8;
var KEY_ZERO = 48;
var KEY_NINE = 57;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;

//Timers
var going = true;

//Event listeners
window.addEventListener("keydown", handleKeyDownEvent);
window.addEventListener("keyup", handleKeyUpEvent);
window.addEventListener("instruction", handleInstruction);

window.setInterval("draw()", 100);

//Arrays
//The battleField Matrix of buildings and troops
var battleField = new Array(fieldHeight);
for (var i = 0; i < fieldHeight; i++)
{
	battleField[i] = new Array(fieldWidth);
	for (var j = 0; j < fieldWidth; j++)
		battleField[i][j] = null;
}

//The array of all battle field effects
var effects = [];

//The array of words that have been in the commands
var myWords = new Array(256);
for(var i = 0; i<256; i++)
{
	myWords[i] = [];
}

//hash function for words
function hash(word)
{
	var sum = 0;
	for(var i=0; i<word.length; i++)
		sum += (word.charCodeAt(i)-"a".charCodeAt(0));
	return sum % 256;
}

function addWordToMyWords(word)
{
	var index = hash(word);
	for(var i = 0; i<myWords[index].length; i++)
		if(myWords[index][i]==word) return;
	myWords[index].push(word);
}

function printMyWords()
{
	document.getElementById("words").innerHTML = "";
	for(var i = 0; i< myWords.length; i++)
		for(var j = 0; j< myWords[i].length; j++)
			document.getElementById("words").innerHTML += myWords[i][j] + "<br/>";
}

//global functions

//All troops carry out their own mission
function moveon()
{
	for (var i = 0; i < fieldHeight; i++)
		for (var j = 0; j < fieldWidth; j++)
		{
			if (battleField[i][j] != null)
			{
				if (!battleField[i][j]._moved)
					battleField[i][j].moveon();
				else
					battleField[i][j]._moved = false;
			}
		}
}

//Fires die out
function firego()
{
	for (var i = 0; i < effects.length; i++)
		if (effects[i].moveon())
		{
			effects[i] = effects[effects.length - 1];
			effects.pop();
		};
}

//Event handlers
function handleKeyDownEvent(evt)
{
	if (evt.keyCode >= KEY_A && evt.keyCode <= KEY_Z) //If input an letter
	{
		if (txtCommand.innerHTML.substr(0, 4) != "&gt;") //If the first letter of the command line is not ">"
			txtCommand.innerHTML = "&gt;"; //Clear the command line and put a ">"
		txtCommand.innerHTML += String.fromCharCode(evt.keyCode + 32); //Else, just add the letter to the command line
	}
	else if (evt.keyCode == KEY_SPACE || (evt.keyCode >= KEY_ZERO && evt.keyCode <= KEY_NINE)) //Input a space or number
	{
		if (txtCommand.innerHTML.substr(0, 4) != "&gt;") //Same to that in the previous part
			txtCommand.innerHTML = "&gt;";
		if (txtCommand.innerHTML == "&gt;")
			return; //No space at the beginning
		if (txtCommand.innerHTML.charAt(txtCommand.innerHTML.length - 1) != " " || evt.keyCode != KEY_SPACE) //No continuous space
			txtCommand.innerHTML += String.fromCharCode(evt.keyCode);
	}
	else if (evt.keyCode == KEY_BACKSPACE) //Back space
	{
		if (txtCommand.innerHTML.substr(0, 4) != "&gt;")
			txtCommand.innerHTML = "&gt;";
		else
			if (txtCommand.innerHTML.length > 4) //Don't delete the ">"
				txtCommand.innerHTML = txtCommand.innerHTML.substr(0, txtCommand.innerHTML.length - 1);
	}
	else if (evt.keyCode == KEY_ENTER) //Carry out instruction on pressing ENTER
	{
		var instruction = txtCommand.innerHTML.substr(4);
		if(instruction=="auto attack")
		{
			autoAttack = !autoAttack;
			txtCommand.innerHTML = "Auto attacking is "+ (autoAttack?"on":"off");
		}
		else if(instruction=="auto train")
		{
			autoTrain = !autoTrain;
			txtCommand.innerHTML = "Auto training is "+ (autoTrain?"on":"off");
		}
		else if(instruction=="defend")
		{
			autoDefend = !autoDefend;
			txtCommand.innerHTML = "Auto defending is "+ (autoDefend?"on":"off");
		}
		else if(instruction=="p")
		{
			going = !going;
			txtCommand.innerHTML = (going? "continue":"paused");
		}
		else if(instruction=="mission")
		{
			txtCommand.innerHTML = currmission._type+" \""+currmission._detail+"\"";
		}
		else
		{
			var ins = new CustomEvent('instruction',
				{
					'detail' : "red " + txtCommand.innerHTML.substr(4)
				}
				);
			window.dispatchEvent(ins);
			txtCommand.innerHTML = errorInfo;
			if(	!(errorInfo=="Please input instruction!" || 
				errorInfo=="Please input valid instruction." || 
				errorInfo=="Place not found!" ||
				errorInfo=="Troop not found!" ||
				errorInfo=="Target not found!" ||
				errorInfo=="Unrecognized building type." ||
				errorInfo=="Not in the right position!" ||
				errorInfo=="Wrong commander!" ||
				errorInfo=="The building is not a training field!" ||
				errorInfo=="Word doesn't exist!" ||
				errorInfo=="This troop already trained!" ||
				errorInfo=="This building already exist!" ||
				errorInfo=="Building not found!")
				)
			{
				var index = errorInfo.indexOf("!");
				addWord(errorInfo.substr(index+1));
			}
		}
	}
	else if (evt.keyCode == KEY_LEFT) //Rolling the screen to left
		viewPointMoving[0] = -20;
	else if (evt.keyCode == KEY_RIGHT) //Rolling the screen to right
		viewPointMoving[0] = 20;
	else if (evt.keyCode == KEY_UP) //Rolling the screen upward
		viewPointMoving[1] = -20;
	else if (evt.keyCode == KEY_DOWN) //Rolling the screen downward
		viewPointMoving[1] = 20;
	else
		null;
}

function handleKeyUpEvent(evt)
{
	if (evt.keyCode == KEY_LEFT || evt.keyCode == KEY_RIGHT) //Stop rolling screen horizontally
		viewPointMoving[0] = 0;
	else if (evt.keyCode == KEY_UP || evt.keyCode == KEY_DOWN) //Stop rolling screen vertically
		viewPointMoving[1] = 0;
}

var errorInfo;
function handleInstruction(evt)
{
	var instruction = evt.detail;
	var type,
	operator,
	subject;
	var words = instruction.split(" ");
	var position,
	troop;
	while (words[0] == " ")
		words.shift();
	while (words[words.length - 1] == " ")
		words.pop();
	if (words.length < 2)
		errorInfo = "Please input instruction!";
	var commanderColor = words[0];
	words.shift();
	type = words[0];
	switch (type)
	{
	case "move":
		if (words.length < 3)
		{
			errorInfo = "Please input valid instruction.";
			return;
		}
		subject = words[words.length - 1];
		position = positionOfWord(subject);
		if (position == null)
		{
			errorInfo = "Place not found!";
			return;
		}
		errorInfo = "Yes sir!";
		for (var i = 1; i < words.length - 1; i++)
		{
			operator = words[i];
			troop = searchTroop(operator);
			if (troop == null)
			{
				errorInfo = "Troop not found!";
				return;
			}
			var color = battleField[troop[0]][troop[1]]._color;
			if (color != commanderColor)
			{
				errorInfo = "Wrong commander!";
				return;
			}
			battleField[troop[0]][troop[1]]._target = position;
			battleField[troop[0]][troop[1]]._enemy = null;
			errorInfo += (" " + operator + " " + checkMeaning(operator));
			if(color=="red") addWordToMyWords(operator);
		}
		errorInfo += (" " + subject + " " + checkMeaning(subject));
		if(color=="red") addWordToMyWords(subject);
		break;
	case "goto":
		if (words.length != 2)
		{
			errorInfo = "Please input valid instruction.";
			return;
		}
		subject = words[1];
		position = positionOfWord(subject);
		if (position == null)
		{
			errorInfo = "Place not found!";
			return;
		}
		viewPoint = [position[1] * gridSize, position[0] * gridSize];
		if (viewPoint[0] < 0)
			viewPoint[0] = 0;
		if (viewPoint[1] < 0)
			viewPoint[1] = 0;
		if (viewPoint[0] + screenWidth > fieldWidth * gridSize)
			viewPoint[0] = fieldWidth * gridSize - screenWidth;
		if (viewPoint[1] + screenHeight > fieldHeight * gridSize)
			viewPoint[1] = fieldHeight * gridSize - screenHeight;
		errorInfo = "Done!" + " " + subject + " " + checkMeaning(subject);
		addWordToMyWords(subject);
		break;
	case "attack":
		if (words.length < 3)
		{
			errorInfo = "Please input valid instruction.";
			return;
		}
		subject = words[words.length - 1];
		errorInfo = "Yes sir!";
		for (var i = 1; i < words.length - 1; i++)
		{
			operator = words[i];
			objtroop = searchTroop(operator);
			if (objtroop == null)
			{
				errorInfo = "Troop not found!";
				return;
			}

			if (searchTroop(subject) == null && searchBuilding(subject) == null)
			{
				errorInfo = "Target not found!";
				return;
			}
			var color = battleField[objtroop[0]][objtroop[1]]._color;
			if (color != commanderColor)
			{
				errorInfo = "Wrong commander!";
				return;
			}
			battleField[objtroop[0]][objtroop[1]]._enemy = subject;
			errorInfo += (" " + operator + " " + checkMeaning(operator));
			addWordToMyWords(operator);
		}
		errorInfo += (" " + subject + " " + checkMeaning(subject));
		if(color=="red") addWordToMyWords(subject);
		break;
	case "stop":
		if (words.length < 2)
		{
			errorInfo = "Please input valid instruction.";
			return;
		}
		errorInfo = "Yes sir!";
		for (var i = 1; i < words.length; i++)
		{
			operator = words[i];
			objtroop = searchTroop(operator);
			if (objtroop == null)
			{
				errorInfo = "Troop not found!";
				return;
			}
			var color = battleField[objtroop[0]][objtroop[1]]._color;
			if (battleField[objtroop[0]][objtroop[1]]._color != commanderColor)
			{
				errorInfo = "Wrong commander!";
				return;
			}
			battleField[objtroop[0]][objtroop[1]]._target = null;
			battleField[objtroop[0]][objtroop[1]]._enemy = null;
			errorInfo += (" " + operator + " " + checkMeaning(operator));
			if(color == "red") addWordToMyWords(operator);
		}
		break;
	case "build":
		if (words.length < 3)
		{
			errorInfo = "Please input valid instruction.";
			return;
		}
		errorInfo = "Yes sir!";
		subject = words[words.length - 1];
		if (subject != "tower" &&
			subject != "training")
		{
			errorInfo = "Unrecognized building type.";
			return;
		}
		for (var i = 1; i < words.length - 1; i++)
		{
			operator = words[i];
			objtroop = searchTroop(operator);
			var color = battleField[objtroop[0]][objtroop[1]]._color;
			if (objtroop == null)
			{
				errorInfo = "Troop not found!";
				return;
			}
			if (color != commanderColor)
			{
				errorInfo = "Wrong commander!";
				return;
			}
			var buildWord = wordAtPosition(objtroop);
			if (buildWord != operator)
			{
				errorInfo = "Not in the right position!";
				return;
			}
			battleField[objtroop[0]][objtroop[1]]._word = "";
			battleField[objtroop[0]][objtroop[1]] = new Building(buildWord, color, subject);
			errorInfo += (" " + operator + " " + checkMeaning(operator)
				 + " " + buildWord + checkMeaning(buildWord));
			if(color == "red") addWordToMyWords(operator);
		}
		break;
	case "train":
		if (words.length != 3)
		{
			errorInfo = "Please input valid instruction.";
			return;
		}
		operator = words[1];
		subject = words[2];
		var objbuilding = searchBuilding(operator);
		if (objbuilding == null)
		{
			errorInfo = "Building not found!";
			return;
		}
		var color = battleField[objbuilding[0]][objbuilding[1]]._color;
		if (color != commanderColor)
		{
			errorInfo = "Wrong commander!";
			return;
		}
		if (battleField[objbuilding[0]][objbuilding[1]]._type != "training")
		{
			errorInfo = "The building is not a training field!";
			return;
		}
		if (positionOfWord(subject) == null)
		{
			errorInfo = "Word doesn't exist!";
			return;
		}
		if (searchTroop(subject) != null)
		{
			errorInfo = "This troop already trained!";
			return;
		}
		if (searchBuilding(subject) != null)
		{
			errorInfo = "This building already exist!";
			return;
		}
		
		color = battleField[objbuilding[0]][objbuilding[1]]._color;
		if (objbuilding[0] > 0 && battleField[objbuilding[0] - 1][objbuilding[1]] == null)
		{
			battleField[objbuilding[0] - 1][objbuilding[1]] =
				new Troop(subject, color, [objbuilding[0] - 1, objbuilding[1]]);
		}
		else if (objbuilding[1] > 0 && battleField[objbuilding[0]][objbuilding[1] - 1] == null)
		{
			battleField[objbuilding[0]][objbuilding[1] - 1] =
				new Troop(subject, color, [objbuilding[0], objbuilding[1] - 1]);
		}
		else if (objbuilding[0] < fieldHeight - 1 && battleField[objbuilding[0] + 1][objbuilding[1]] == null)
		{
			battleField[objbuilding[0] + 1][objbuilding[1]] =
				new Troop(subject, color, [objbuilding[0] + 1, objbuilding[1]]);
		}
		else if (objbuilding[1] < fieldWidth - 1 && battleField[objbuilding[0]][objbuilding[1] + 1] == null)
		{
			battleField[objbuilding[0]][objbuilding[1] + 1] =
				new Troop(subject, color, [objbuilding[0], objbuilding[1] + 1]);
		}
		else
		{
			errorInfo = "No room for new troop!";
			return;
		}
		
		errorInfo = "Done!";
		errorInfo += (" " + subject + checkMeaning(subject)
			 + " " + operator + " " + checkMeaning(operator));
		if(color=="red")
		{
			addWordToMyWords(operator);
			addWordToMyWords(subject);
		}
		break;
	default:
		errorInfo = "Unrecognized instruction!";
	}
}

//Count how many times does ch appear in string str
function countChar(str, ch)
{
	var sum = 0;
	for (var i = 0; i < str.length; i++)
		if (str.charAt(i) == ch)
			sum++;

	return sum;
}

//Attack force of word, which is the number of 'a's plus 1
function force(word)
{
	return countChar(word, 'a') + 1;
}

//Speed of a word, which is the number of 'e's plus 1
function speed(word)
{
	return countChar(word, 'e') + 1;
}

//Firing range of a word, which is the number of 'i's plus 1
function range(word)
{
	return countChar(word, 'i') + 1;
}

//Get the position of a word in the big map
function positionOfWord(word)
{
	var index = binarySearchInToeflWords(word);
	if (index == null || index >= fieldWidth * fieldHeight)
		return null;
	else
		return [Math.floor(index / fieldWidth), index % fieldWidth];
}

//Get the word at a specific position
function wordAtPosition(pos)
{
	return toeflWords[pos[0] * fieldWidth + pos[1]];
}

//Random Word
function randomWord()
{
	return wordAtPosition(	[Math.floor(Math.random()*fieldHeight),
							Math.floor(Math.random()*fieldHeight)]);
}

//Search for a troop by word in the battle field
function searchTroop(word)
{
	for (var i = 0; i < fieldHeight; i++)
		for (var j = 0; j < fieldWidth; j++)
		{
			if (battleField[i][j] != null &&
				battleField[i][j]._type == "troop" &&
				battleField[i][j]._word == word)
				return [i, j];
		}
	return null;
}

//Search for a building by word in the battle field
function searchBuilding(word)
{
	for (var i = 0; i < fieldHeight; i++)
		for (var j = 0; j < fieldWidth; j++)
		{
			if (battleField[i][j] != null &&
				battleField[i][j]._type != "troop" &&
				battleField[i][j]._word == word)
				return [i, j];
		}
	return null;
}

//Check meaning of words in dictionary
function checkMeaning(word)
{
	return youdaoDictionaryGetMeaning(binarySearchInDict(word));
}

//Check first meaning of words in dictionary
function firstMeaning(word)
{
	var meaning = youdaoDictionaryGetMeaning(binarySearchInDict(word));
	if (meaning == null)
		return null;
	meaning = meaning.substr(1);
	var index = meaning.indexOf(" ");
	meaning = meaning.substr(index + 1);
	index = meaning.search(/[\b,.;]/);
	if (index > 0)
		meaning = meaning.substr(0, index);
	if (meaning.length > 6)
		meaning.substr(0, 6);
	return meaning;
}
