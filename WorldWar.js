

var countries = [];
countries.push(["red",[10,10]]);
countries.push(["yellow",[40,25]]);
countries.push(["orange",[50,10]]);
countries.push(["black",[24,34]]);
countries.push(["blue",[25,58]]);
countries.push(["brown",[40,42]]);
countries.push(["white",[50,70]]);
countries.push(["purple",[10,60]]);

var autoTrain = false;
var autoAttack = false;
var autoDefend = true;
var myColor = "red";

function test()
{
	debug = true;
}

function setCountry(index) {
	var p = [countries[index][1][0],countries[index][1][1]];
	battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"training");
	p[0]-=2;p[1]-=2;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[1]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]-=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
}

for(var i = 0; i < 8; i++)
	setCountry(i);

window.setInterval("if(going) moveon();", 100);
window.setInterval("firego()", 20);
window.setInterval("draw()", 100);

var baseAIs = [];

function generateAIForEachBase() {
	trainingBases = [];
	for(var i = 0; i < fieldHeight; i++) {
		for(var j = 0; j < fieldWidth; j++) {
			if(battleField[i][j] != null) {
				if(battleField[i][j]._type == "training") {
					trainingBases.push([battleField[i][j],[i,j]]);
				}
			}
		}
	}
	newBaseAIs = [];
	for(var i = 0; i < trainingBases.length; i++) {
		var found = null;
		for(var j = 0; j < baseAIs.length; j++) {
			if(baseAIs[j]._base[0] == trainingBases[i][1][0] &&
				 baseAIs[j]._base[1] == trainingBases[i][1][1] &&
				 baseAIs[j]._color == trainingBases[i][0]._color) {
				found = j;
				break;
			}
		}
		if(found != null) {
			newBaseAIs.push(baseAIs[found]);
		} else {
			if(trainingBases[i][0]._color == myColor) {
				newBaseAIs.push(new BaseAI(
					trainingBases[i][0]._color, trainingBases[i][1], 6, 6, 6, 6, 6));
			} else {
				newBaseAIs.push(new BaseAI(
					trainingBases[i][0]._color, trainingBases[i][1], 12, 12, 12, 12, 12));
			}
		}
	}
	baseAIs = newBaseAIs;
}

function executeAllAITrain() {
	if(!going) return;
	for(var i = 0; i < baseAIs.length; i++) {
		if(baseAIs[i]._color != myColor || autoTrain) {
			baseAIs[i].train();
		}
	}
}

function executeAllAIDefend() {
	if(!going) return;
	for(var i = 0; i < baseAIs.length; i++) {
		if(baseAIs[i]._color != myColor || autoDefend) {
			baseAIs[i].defend();
		}
	}
}

function executeAllAIAttack() {
	if(!going) return;
	for(var i = 0; i < baseAIs.length; i++) {
		if(baseAIs[i]._color != myColor || autoAttack) {
			baseAIs[i].defendAttack();
		}
	}
}

window.setInterval("generateAIForEachBase();",2000);
window.setInterval("executeAllAIDefend();",500);
window.setInterval("executeAllAITrain();",10000);
window.setInterval("executeAllAIAttack();",1000);

expandAIs = [new ExpandAI("red")];

function executeAllExpandTrainings() {
	for(var i = 0; i < expandAIs.length; i++) {
		expandAIs[i].expandTraining();
	}
}

function executeAllBuildTrainings() {
	for(var i = 0; i < expandAIs.length; i++) {
		expandAIs[i].buildTraining();
	}
}

window.setInterval("executeAllExpandTrainings();",10000);
window.setInterval("executeAllBuildTrainings();",100);
