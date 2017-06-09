/**
 *  file: draw.js
 *  brief: all the drawing functions here
 */

 var gridSize = 100;
 var viewPoint = [0,0];
 
 var viewPointMoving = [0,0];
 
function draw()
{
	var ctx = cvs.getContext("2d");
	ctx.clearRect(0,0,screenWidth,screenHeight);
	if(	viewPoint[0] + screenWidth + viewPointMoving[0] <= gridSize*fieldWidth &&
		viewPoint[0] + viewPointMoving[0] >= 0)
		viewPoint[0] += viewPointMoving[0];
	if(	viewPoint[1] + screenHeight + viewPointMoving[1] <= gridSize*fieldHeight &&
		viewPoint[1] + viewPointMoving[1] >= 0)
		viewPoint[1] += viewPointMoving[1];
	drawBattleField(ctx);
	drawTroopsAndBuildings(ctx);
	drawEffects(ctx);
	drawPannel(ctx);
}

function drawBattleField(ctx)
{
	var mini = Math.floor(viewPoint[1] / gridSize);
	var minj = Math.floor(viewPoint[0] / gridSize);
	var maxi = Math.ceil((viewPoint[1]+screenHeight) / gridSize);
	var maxj = Math.ceil((viewPoint[0]+screenWidth) / gridSize);
	for(var i=mini; i<=maxi; i++)
		for(var j=minj; j<=maxj; j++)
		{
			var x = j * gridSize - viewPoint[0];
			var y = i * gridSize - viewPoint[1];
			ctx.save();
			ctx.fillStyle = "rgb(0,"+(200 + 10 * ((i+j+Math.floor(i*j)) % 4))+",0)";
			ctx.fillRect(x, y, gridSize, gridSize);
			var word = wordAtPosition([i,j]);
			var meaning = firstMeaning(word);
			ctx.fillStyle = "black";
			ctx.font = Math.floor(gridSize/6) + "px sans-serif";
			ctx.fillText(word, x + gridSize/20, y + gridSize/6);
			ctx.fillText(meaning, x + gridSize/20, y + gridSize/6 + gridSize/3);
			ctx.restore();
		}
}

function drawTroopsAndBuildings(ctx)
{
	for(var i = 0; i < fieldHeight; i++)
		for(var j=0; j < fieldWidth; j++)
		{
			if(battleField[i][j]!=null)
			{
				var x = j * gridSize - viewPoint[0];
				var y = i * gridSize - viewPoint[1];
				if(battleField[i][j]._type=="troop")
				{
					ctx.save();
					ctx.fillStyle = battleField[i][j]._color;
					ctx.drawImage(document.getElementById("troop"),x,y+gridSize/6);
					ctx.fillRect( x+gridSize/4, y-gridSize/6, gridSize/2*battleField[i][j]._life/20,5);
					ctx.font = Math.floor(gridSize/6) + "px sans-serif";
					//ctx.fillText(battleField[i][j]._word, x + gridSize/4, y);
					ctx.fillText(firstMeaning(battleField[i][j]._word), x + gridSize/4, y);
					ctx.restore();
				}
				else if(battleField[i][j]._type=="tower")
				{
					ctx.save();
					ctx.drawImage(document.getElementById("tower"),x,y);
					ctx.fillStyle = battleField[i][j]._color;
					ctx.fillRect(x+gridSize/4, y-gridSize/6, gridSize/2*battleField[i][j]._life/50,5);
					ctx.font = Math.floor(gridSize/6) + "px sans-serif";
					ctx.fillText(battleField[i][j]._word, x + gridSize/4, y);
					ctx.restore();
				}
				else if(battleField[i][j]._type=="training")
				{
					ctx.save();
					ctx.drawImage(document.getElementById("camp"),x,y);
					ctx.fillStyle = battleField[i][j]._color;
					ctx.fillRect( x+gridSize/4, y-gridSize/6, gridSize/2*battleField[i][j]._life/100,5);
					ctx.font = Math.floor(gridSize/6) + "px sans-serif";
					ctx.fillText(battleField[i][j]._word, x + gridSize/4, y);
					ctx.restore();
				}
			}
		}
}

function drawEffects(ctx)
{
	for(var i=0; i<effects.length; i++)
	{
		var s = effects[i]._timeleft/50;
		switch (effects[i]._type)
		{
		case "fire":
			var x = effects[i]._position[0] - viewPoint[0];
			var y = effects[i]._position[1] - viewPoint[1];
			ctx.save();
			ctx.fillStyle = "yellow";
			ctx.beginPath();
			ctx.moveTo(x-gridSize/2*s,y-gridSize/2*s);
			ctx.lineTo(x,y-gridSize/6*s);
			ctx.lineTo(x+gridSize/2*s,y-gridSize/2*s);
			ctx.lineTo(x+gridSize/6*s,y);
			ctx.lineTo(x+gridSize/2*s,y+gridSize/2*s);
			ctx.lineTo(x,y+gridSize/6*s);
			ctx.lineTo(x-gridSize/2*s,y+gridSize/2*s);
			ctx.lineTo(x-gridSize/6*s,y);
			ctx.fill();
			ctx.restore();
			break;
		case "rock":
			var x = effects[i]._position[0] - viewPoint[0];
			var y = effects[i]._position[1] - viewPoint[1];
			ctx.save();
			if(s > 0.5)
			{
				ctx.fillStyle = "rgb(136,0,21)";
				ctx.beginPath();
				ctx.moveTo(x+gridSize*(1-s)-10, y+gridSize*(1-s)*(1-s)*2);
				ctx.lineTo(x+gridSize*(1-s), y+gridSize*(1-s)*(1-s)*2-10);
				ctx.lineTo(x+gridSize*(1-s)+10, y+gridSize*(1-s)*(1-s)*2);
				ctx.lineTo(x+gridSize*(1-s), y+gridSize*(1-s)*(1-s)*2+10);
				ctx.fill();
			}
			else
			{
				ctx.fillStyle = "yellow";
				x += gridSize/2; y+= gridSize/2;
				ctx.beginPath();
				ctx.moveTo(x-gridSize*s,y-gridSize*s);
				ctx.lineTo(x,y-gridSize/3*s);
				ctx.lineTo(x+gridSize*s,y-gridSize*s);
				ctx.lineTo(x+gridSize/3*s,y);
				ctx.lineTo(x+gridSize*s,y+gridSize*s);
				ctx.lineTo(x,y+gridSize/3*s);
				ctx.lineTo(x-gridSize*s,y+gridSize*s);
				ctx.lineTo(x-gridSize/3*s,y);
				ctx.fill();
			}
			ctx.restore();
			break;
		case "word":
			ctx.save();
			ctx.fillStyle = "rgb(255,0,0)";
			ctx.font = effects[i]._timeleft+"px sans-serif";
			ctx.fillText(effects[i]._word,0,screenHeight/3);
			ctx.restore();
			break;
		}
	}
}

function drawPannel(ctx)
{
	ctx.save();
	ctx.fillStyle = "orange";
	ctx.fillRect(screenWidth,0,180,screenHeight);
	
	for(var i=0; i<fieldHeight; i++)
		for(var j=0; j<fieldWidth; j++)
		{
			if(battleField[i][j]==null)
				ctx.fillStyle = "green";
			else
				ctx.fillStyle = battleField[i][j]._color;
			ctx.fillRect(screenWidth+2*j,2*i,2,2);
		}
	ctx.strokeRect(	viewPoint[0]/fieldWidth/gridSize*180+screenWidth,
					viewPoint[1]/fieldHeight/gridSize*120,
					screenWidth/fieldWidth/gridSize*180,
					screenHeight/fieldHeight/gridSize*120);
	ctx.restore();
}
