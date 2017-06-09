/**
 *  file class.js
 *  brief all the classes used in the game
 *
 *  Troop: all the troops, with attributes word/color/target/life etc.
 *  Building: all the buildings, with attributes word/color/type etc.
 *  Fire: the battle field effect
 */

var debug = false;
//Troop
function Troop(word, color, pos)
{
	this._word = word;
	this._color = color;
	this._target = null;
	this._enemy = null;
	this._life = word.length * 5;
	this._position = pos;
	this._force = force(word);
	this._speed = speed(word);
	this._range = range(word);
	this._type = "troop";
	this._moved = false;
	this._arranged = false;
}

Troop.prototype.damaged = function (force)
{
	this._life -= force;
	if(this._life <= 0) this._word = "";
	return this._life <= 0; //If dead, return true
}

//Move to target
Troop.prototype.moveon = function ()
{
	//If target enemy exists, set the position of enemy to be the target position
	if (this._enemy != null)
	{
		this._target = searchTroop(this._enemy);
		if (this._target == null)
			this._target = searchBuilding(this._enemy);
		if (this._target == null)
			this._enemy = null;
	}
	//Go to the target
	if (this._target != null)
	{
		for (steps = this._speed; steps > 0; )
		{
			var newPos = [];
			var moved = false;
			//If reached the target, stop moving
			if (this._position[0] == this._target[0] &&
				this._position[1] == this._target[1])
			{
				this._target = null;
				break;
			}
			//If touch the target but the target is not null, stop
			if(	Math.abs(this._position[0] - this._target[0]) +
				Math.abs(this._position[1] - this._target[1]) ==1 &&
				battleField[this._target[0]][this._target[1]] != null )
				break;
			
			//If enemy is within range, stop moving
			if (this._enemy != null)
			{
				if (Math.abs(this._target[0] - this._position[0]) +
					Math.abs(this._target[1] - this._position[1]) <= this._range)
					break;
			}
			//Else, move in a random direction toward the target
			var dir = Math.floor(Math.random() * 2);
			for(var i=0; i<2; i++)
			{
				newPos = [this._position[0], this._position[1]];
				if (this._target[dir] > this._position[dir])
					newPos[dir]++;
				else if (this._target[dir] < this._position[dir])
					newPos[dir]--;
				if(	newPos[0]<0 || newPos[0]>=fieldHeight ||
					newPos[1]<0 || newPos[1]>=fieldWidth)
					break;
				if(battleField[newPos[0]][newPos[1]] == null)
				{
					steps--;
					moved = true;
					break;
				}
				dir=1-dir;
			}
			//If in the new position is not empty, stop
			if (moved)
			{
				battleField[newPos[0]][newPos[1]] = this;
				battleField[this._position[0]][this._position[1]] = null;
				if (newPos[0] > this._position[0] ||
					(newPos[0] == this._position[0] && newPos[1] > this._position[1]))
					this._moved = true;
				this._position[0] = newPos[0];
				this._position[1] = newPos[1];
				continue;
			}
			else
			{
				dir = Math.floor(Math.random() * 2);
				for(var i=0; i<2; i++)
				{
					newPos = [this._position[0], this._position[1]];
					if (this._target[dir] <= this._position[dir])
						newPos[dir]++;
					else if (this._target[dir] >= this._position[dir])
						newPos[dir]--;
					if(	newPos[0]<0 || newPos[0]>=fieldHeight ||
						newPos[1]<0 || newPos[1]>=fieldWidth)
						break;
					if(battleField[newPos[0]][newPos[1]] == null)
					{
						steps--;
						moved = true;
					}
					dir=1-dir;
					break;
				}
			}
			
			if(moved)
			{
				battleField[newPos[0]][newPos[1]] = this;
				battleField[this._position[0]][this._position[1]] = null;
				if (newPos[0] > this._position[0] ||
					(newPos[0] == this._position[0] && newPos[1] > this._position[1]))
					this._moved = true;
				this._position[0] = newPos[0];
				this._position[1] = newPos[1];
			}
			else
				break;
		}
	}
	
	var ins = new CustomEvent('occupy',
		{'detail' : this._color+" "+this._word+" "+this._type+" "+wordAtPosition(this._position)});
	window.dispatchEvent(ins);
	
	//Search for enemies around in range to attack
	for (var i = this._position[0] - this._range;
		i <= this._position[0] + this._range;
		i++)
	{
		for (var j = this._position[1] - (this._range - Math.abs(i - this._position[0]));
			j <= this._position[1] + (this._range - Math.abs(i - this._position[0]));
			j++)
		{
			if (i >= 0 && j >= 0 && i<fieldHeight && j<fieldWidth && battleField[i][j] != null)
			{
				if (battleField[i][j]._color != this._color)
				{
					addFire(battleField[i][j]._position);
					if (battleField[i][j].damaged(this._force))
						battleField[i][j] = null; //Dead
					return; //Only attack one of the enemies
				}
			}
		}
	}
}

//Building
function Building(word, color, type)
{
	this._word = word;
	this._color = color;
	this._type = type;
	this._life = word.length * 20;
	this._position = positionOfWord(word);
}

Building.prototype.moveon = function ()
{
	switch (this._type)
	{
	case "tower":
		//Search for enemies around in range to attack
		for (var i = this._position[0] - range(this._word);
			i <= this._position[0] + range(this._word);
			i++)
		{
			for (var j = this._position[1] - (range(this._word) - Math.abs(i - this._position[0]));
				j <= this._position[1] + (range(this._word) - Math.abs(i - this._position[0]));
				j++)
			{
				if (i >= 0 && j >= 0 && i<fieldHeight && j<fieldWidth && battleField[i][j] != null)
				{
					if (battleField[i][j]._color != this._color)
					{
						addRock(battleField[i][j]._position);
						if (battleField[i][j].damaged(force(this._word)))
							battleField[i][j] = null; //Dead
						return; //Only attack one of the enemies
					}
				}
			}
		}
		break;
	case "training":
		break;
	}
}

Building.prototype.damaged = function (force)
{
	this._life -= force;
	if(this._life <= 0) this._word = "";
	return this._life <= 0; //If dead, return true
}

function price(type)
{
	switch(type)
	{
	case "troop": return 50;
	case "tower": return 200;
	case "training": return 300;
	}
	return 0;
}

//Fire
function Fire(position)
{
	this._position = [position[1] * gridSize + gridSize / 2 + gridSize * (Math.random() / 2 - 0.25),
		position[0] * gridSize + gridSize / 2 + gridSize * (Math.random() / 2 - 0.25)];
	this._timeleft = 50;
	this._type = "fire";
}

Fire.prototype.moveon = function ()
{
	this._timeleft--;
	return this._timeleft <= 0;
}

function Rock(position)
{
	this._position = [position[1] * gridSize, position[0] * gridSize];
	this._timeleft = 50;
	this._type = "rock";
}

Rock.prototype.moveon = function ()
{
	this._timeleft--;
	return this._timeleft <= 0;
}

function BigWord(word)
{
	this._word = word;
	this._timeleft = 100;
	this._type = "word";
}

BigWord.prototype.moveon = function ()
{
	this._timeleft-=2;
	return this._timeleft <= 0;
}
//add fire to the list of effects
function addFire(position)
{
	effects.push(new Fire(position));
}

function addRock(position)
{
	effects.push(new Rock(position));
}

function addWord(word)
{
	effects.push(new BigWord(word));
}
