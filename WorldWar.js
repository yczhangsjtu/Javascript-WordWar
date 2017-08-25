

var countries = [];
countries.push(["red",[10,10]]);
countries.push(["yellow",[40,25]]);
countries.push(["orange",[50,10]]);
countries.push(["black",[24,34]]);
countries.push(["blue",[25,58]]);
countries.push(["brown",[40,42]]);
countries.push(["white",[50,70]]);
countries.push(["purple",[10,60]]);

var p=[], index;
var autoTrain = false;
var autoAttack = false;
var autoDefend = true;

function test()
{
	debug = true;
}

function setCountry(index) {
	p = [countries[index][1][0],countries[index][1][1]];
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

var ai = new Array(8);
for(var i=1; i<8; i++)
{
	ai[i]=new AI(i,12,12,12,12,12);
	window.setInterval("if(going) ai["+i+"].train()",10000);
	window.setInterval("if(going) ai["+i+"].defend()",500);
	window.setInterval("if(going) ai["+i+"].defendAttack()",1000);
}

ai[0]=new AI(0,12,12,12,12);
window.setInterval("if(autoDefend && going) ai["+0+"].defend()",500);
window.setInterval("if(autoTrain && going) ai["+0+"].train();",10000);
window.setInterval("if(autoAttack && going) ai["+0+"].defendAttack();",1000);
