function Mission(type,detail)
{
	this._type = type;
	this._detail = detail;
}

var missions = [];

for(var i = 0; i<inWords.length; i++)
{
	swap(inWords,i,Math.floor(inWords.length*Math.random()));
}

for(var i = 0; i<inWords.length; i++)
{
	missions.push(new Mission("Attack and occupy",inWords[i]));
}

var currmission;
var curr;
var ai = new Array(2);
var timers = [];

startMissions();

function startMissions()
{
	countries = [];
	countries.push(["red",[10,10]]);
	countries.push(["blue",[25,48]]);
	countries.push(["yellow",[50,32]]);

	var p=[], index;
	var autoTrain = true;
	var autoAttack = true;
	var autoDefend = true;

	index = 0;
	p = [countries[index][1][0],countries[index][1][1]];
	battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"training");
	p[0]-=2;p[1]-=2;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[1]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]-=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");


	index = 1;
	p = [countries[index][1][0],countries[index][1][1]];
	battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"training");
	p[0]-=2;p[1]-=2;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[1]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]-=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");

	index = 2;
	p = [countries[index][1][0],countries[index][1][1]];
	battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"training");
	p[0]-=2;p[1]-=2;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[1]+=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");
	p[0]-=4;battleField[p[0]][p[1]] = new Building(wordAtPosition(p),countries[index][0],"tower");

	window.setInterval("if(going) moveon();", 1000);
	window.setInterval("firego()", 20);

	
	for(var i=0; i<2; i++)
		ai[i]=new AI(i+1,12,12,12,12,12);
	
	for(var i=0; i<2; i++)
	{
		timers.push([window.setInterval("if(going) ai["+i+"].train()",10000),
					window.setInterval("if(going) ai["+i+"].defend()",500),
					window.setInterval("if(going) ai["+i+"].troopDefend()",1000)]);
	}

	curr = 0;
	currmission = missions[curr];
	startMission(currmission);
	txtCommand.innerHTML = currmission._type+" \""+currmission._detail+"\"";
}



window.addEventListener('occupy',handleOccupy);

function handleOccupy(evt)
{
	var info = evt.detail.split(" ");
	if(info[0]=="red" && info[3]==currmission._detail)
	{
		curr ++;
		currmission = missions[curr];
		startMission(currmission);
		addWord("Mission accomplished!");
		txtCommand.innerHTML = currmission._type+" \""+currmission._detail+"\"";
	}
}

function startMission(mission)
{
	switch(mission._type)
	{
	case "Attack and occupy":
		for(var i=0; i<2; i++)
		{
			window.clearInterval(timers[i][2]);
			timers[i][2]=window.setInterval("if(going) ai["+i+"].attack(\'"+mission._detail+"\')",1000);
		}
		break;
	}
}
