var countries = [];

function AI(index,maxGuard,maxTroop1,maxTroop2,maxTroop3,maxTroop4)
{
	this._index = index;
	this._guards = [];
	this._troops = [[],[],[],[]];
	this._color = countries[index][0];
	this._maxGuard = maxGuard;
	this._maxTroop = [maxTroop1,maxTroop2,maxTroop3,maxTroop4];
	this._isAttacking = [false,false,false,false];
	for(var i=0; i<fieldHeight; i++)
		for(var j=0; j<fieldWidth; j++)
		{
			if(battleField[i][j]!=null && battleField[i][j]._type=="troop" && battleField[i][j]._color==this._color)
				this._troops.push(battleField[i][j]);
		}
	this._base = countries[index][1];
	this._training = battleField[this._base[0]][this._base[1]]._word;
}

AI.prototype.train = function()
{
	if(	this._guards.length < this._maxGuard ||
		this._troops[0].length < this._maxTroop[0] ||
		this._troops[1].length < this._maxTroop[1] ||
		this._troops[2].length < this._maxTroop[2] ||
		this._troops[3].length < this._maxTroop[3])
	{
		var ins = new CustomEvent('instruction',
		{
			'detail' : this._color + " train " + this._training + " " + randomWord()
		}
		);
		window.dispatchEvent(ins);
	}
	
	for(var i=0; i<this._guards.length;)
	{
		if(this._guards[i]._word=="")
		{
			this._guards[i] = this._guards[this._guards.length-1];
			this._guards.pop();
		}
		else
			i++;
	}
	for(var k=0; k<4; k++)
		for(var i=0; i<this._troops[k].length;)
		{
			if(this._troops[k][i]._word=="")
			{
				this._troops[k][i] = this._troops[k][this._troops[k].length-1];
				this._troops[k].pop();
			}
			else
				i++;
		}
	
	for(var i=0; i<fieldHeight; i++)
		for(var j=0; j<fieldWidth; j++)
		{
			if(	battleField[i][j]!=null && battleField[i][j]._type=="troop" &&
				battleField[i][j]._color==this._color &&
				!battleField[i][j]._arranged)
			{
				battleField[i][j]._arranged = true;
				
				var order = [0,1,2,3];
				var n = Math.floor(Math.random() * 2);
				swap(order,n,1);
				n = Math.floor(Math.random() * 3);
				swap(order,n,2);
				n = Math.floor(Math.random() * 4);
				swap(order,n,3);
				
				
				if(this._guards.length<this._maxGuard)
					this._guards.push(battleField[i][j]);
				else if(this._troops[order[0]].length<this._maxTroop[order[0]])
					this._troops[order[0]].push(battleField[i][j]);
				else if(this._troops[order[1]].length<this._maxTroop[order[1]])
					this._troops[order[1]].push(battleField[i][j]);
				else if(this._troops[order[2]].length<this._maxTroop[order[2]])
					this._troops[order[2]].push(battleField[i][j]);
				else if(this._troops[order[3]].length<this._maxTroop[order[3]])
					this._troops[order[3]].push(battleField[i][j]);
				else
					battleField[i][j]._arranged = false;
			}
		}
}

AI.prototype.defend = function()
{
	if(this._guards.length>0)
	{
		if(this._guards[0]._target == null)
		{
			var target = wordAtPosition([this._base[0]-5,this._base[1]-1]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[0]._word + " " + target});
			window.dispatchEvent(ins);
		}
	}
	if(this._guards.length>1)
	{
		if(this._guards[1]._target == null)
		{
			var target = wordAtPosition([this._base[0]+5,this._base[1]+1]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[1]._word + " " + target});
			window.dispatchEvent(ins);
		}
	}
	if(this._guards.length>2)
	{
		if(this._guards[2]._target == null)
		{
			var target = wordAtPosition([this._base[0]-1,this._base[1]+5]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[2]._word + " " + target});
			window.dispatchEvent(ins);
		}
	}
	if(this._guards.length>3)
	{
		if(this._guards[3]._target == null)
		{
			var target = wordAtPosition([this._base[0]+1,this._base[1]-5]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[3]._word + " " + target});
			window.dispatchEvent(ins);
		}
	}
	if(this._guards.length>4)
	{
		var target = wordAtPosition([this._base[0]+4,this._base[1]+1]);
		var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[4]._word + " " + target});
		window.dispatchEvent(ins);
	}
	if(this._guards.length>5)
	{
		var target = wordAtPosition([this._base[0]-4,this._base[1]-1]);
		var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[5]._word + " " + target});
		window.dispatchEvent(ins);
	}
	if(this._guards.length>6)
	{
		var target = wordAtPosition([this._base[0]+1,this._base[1]+4]);
		var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[6]._word + " " + target});
		window.dispatchEvent(ins);
	}
	if(this._guards.length>7)
	{
			var target = wordAtPosition([this._base[0]-1,this._base[1]-4]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[7]._word + " " + target});
			window.dispatchEvent(ins);
	}
	if(this._guards.length>8)
	{
			var target = wordAtPosition([this._base[0]+4,this._base[1]-1]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[8]._word + " " + target});
			window.dispatchEvent(ins);
	}
	if(this._guards.length>9)
	{
			var target = wordAtPosition([this._base[0]-4,this._base[1]+1]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[9]._word + " " + target});
			window.dispatchEvent(ins);
	}
	if(this._guards.length>10)
	{
			var target = wordAtPosition([this._base[0]-1,this._base[1]+4]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[10]._word + " " + target});
			window.dispatchEvent(ins);
	}
	if(this._guards.length>11)
	{
			var target = wordAtPosition([this._base[0]+1,this._base[1]-4]);
			var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[11]._word + " " + target});
			window.dispatchEvent(ins);
	}
	
	for(var i=-1; i<=1; i++)
		for(var j=-1; j<=1; j++)
			if(	battleField[this._base[0]+2+j][this._base[1]+i]!=null &&
				battleField[this._base[0]+2+j][this._base[1]+i]._color != this._color)
			{
				for(var k=0; k<this._guards.length; k++)
				{
					var target = wordAtPosition([this._base[0]+2+j,this._base[1]+i]);
					var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[k]._word + " " + target});
					window.dispatchEvent(ins);
				}
			}
	for(var i=-1; i<=1; i++)
		for(var j=-1; j<=1; j++)
			if(	battleField[this._base[0]-2+j][this._base[1]+i]!=null &&
				battleField[this._base[0]-2+j][this._base[1]+i]._color != this._color)
			{
				for(var k=0; k<this._guards.length; k++)
				{
					var target = wordAtPosition([this._base[0]-2+j,this._base[1]+i]);
					var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[k]._word + " " + target});
					window.dispatchEvent(ins);
				}
			}
	for(var i=-1; i<=1; i++)
		for(var j=-1; j<=1; j++)
			if(	battleField[this._base[0]+j][this._base[1]+2+i]!=null &&
				battleField[this._base[0]+j][this._base[1]+2+i]._color != this._color)
			{
				for(var k=0; k<this._guards.length; k++)
				{
					var target = wordAtPosition([this._base[0]+j,this._base[1]+2+i]);
					var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[k]._word + " " + target});
					window.dispatchEvent(ins);
				}
			}
	for(var i=-1; i<=1; i++)
		for(var j=-1; j<=1; j++)
			if(	battleField[this._base[0]+j][this._base[1]-2+i]!=null &&
				battleField[this._base[0]+j][this._base[1]-2+i]._color != this._color)
			{
				for(var k=0; k<this._guards.length; k++)
				{
					var target = wordAtPosition([this._base[0]+j,this._base[1]-2+i]);
					var ins = new CustomEvent('instruction',{'detail' : this._color+" move " + this._guards[k]._word + " " + target});
					window.dispatchEvent(ins);
				}
			}
	
	
}


AI.prototype.defendAttack = function()
{
	for(var k=0; k<4; k++)
	{
		if(this._troops[k].length>0)
		{
			var target = [-1,-1];
			var base;
			switch(k)
			{
			case 0: base = [this._base[0]-6,this._base[1]-6]; break;
			case 1: base = [this._base[0]-6,this._base[1]+6]; break;
			case 2: base = [this._base[0]+6,this._base[1]-6]; break;
			case 3: base = [this._base[0]+6,this._base[1]+6]; break;
			}
			
			if(this._troops[k].length>=this._maxTroop[k]) this._isAttacking[k] = true;
			if(this._troops[k].length<this._maxTroop[k]/2) this._isAttacking[k] = false;
			
			if(this._isAttacking[k])
			{
				var minx = fieldWidth, maxx = 0;
				var miny = fieldHeight, maxy = 0;
				for(var i=0; i<this._troops[k].length; i++)
				{
					if(this._troops[k][i]._position[0]>maxy) maxy = this._troops[k][i]._position[0];
					if(this._troops[k][i]._position[0]<miny) miny = this._troops[k][i]._position[0];
					if(this._troops[k][i]._position[1]>maxx) maxx = this._troops[k][i]._position[1];
					if(this._troops[k][i]._position[1]<minx) minx = this._troops[k][i]._position[1];
				}
				if(maxy - miny < this._troops[k].length && maxx - minx < this._troops[k].length)
					for(var i=0; i<fieldHeight; i++)
					{
						for(var j=0; j<fieldWidth; j++)
						{
							if(	(battleField[i][j]!=null && 
								battleField[i][j]._color != this._color) &&
								((Math.abs(i-base[0])+Math.abs(j-base[1])<
								Math.abs(target[0]-base[0])+Math.abs(target[1]-base[1]))
								|| (target[0] == -1)))
								target = [i,j];
						}
					}
				else
					target = this._troops[k][0]._position;
			}
			else
			{
				target = [base[0],base[1]];
			}
			
			for(var i = 0; i<this._troops[k].length; i++ )
			{
				var h = Math.floor(Math.random() * 5) - 2;
				var v = Math.floor(Math.random() * 5) - 2;
				var word = wordAtPosition([target[0]+v, target[1]+h]);
				var ins = new CustomEvent('instruction',
				{
					'detail' : this._color+" move " + this._troops[k][i]._word + " " + word
				}
				);
				window.dispatchEvent(ins);
			}
		}
	}
}

AI.prototype.troopDefend = function()
{
	for(var k=0; k<4; k++)
	{
		if(this._troops[k].length>0)
		{
			var target = [-1,-1];
			var base;
			switch(k)
			{
			case 0: base = [this._base[0]-6,this._base[1]-6]; break;
			case 1: base = [this._base[0]-6,this._base[1]+6]; break;
			case 2: base = [this._base[0]+6,this._base[1]-6]; break;
			case 3: base = [this._base[0]+6,this._base[1]+6]; break;
			}
			
			target = [base[0],base[1]];
			
			for(var i = 0; i<this._troops[k].length; i++ )
			{
				var h = Math.floor(Math.random() * 5) - 2;
				var v = Math.floor(Math.random() * 5) - 2;
				var word = wordAtPosition([target[0]+v, target[1]+h]);
				var ins = new CustomEvent('instruction',
				{
					'detail' : this._color+" move " + this._troops[k][i]._word + " " + word
				}
				);
				window.dispatchEvent(ins);
			}
		}
	}
}

AI.prototype.attack = function(tword)
{
	for(var k=0; k<4; k++)
	{
		if(this._troops[k].length>0)
		{
			var target = [-1,-1];
			var base;
			switch(k)
			{
			case 0: base = [this._base[0]-6,this._base[1]-6]; break;
			case 1: base = [this._base[0]-6,this._base[1]+6]; break;
			case 2: base = [this._base[0]+6,this._base[1]-6]; break;
			case 3: base = [this._base[0]+6,this._base[1]+6]; break;
			}
			
			if(this._troops[k].length>=this._maxTroop[k]) this._isAttacking[k] = true;
			if(this._troops[k].length<this._maxTroop[k]/2) this._isAttacking[k] = false;
			
			if(this._isAttacking[k])
			{
				var minx = fieldWidth, maxx = 0;
				var miny = fieldHeight, maxy = 0;
				for(var i=0; i<this._troops[k].length; i++)
				{
					if(this._troops[k][i]._position[0]>maxy) maxy = this._troops[k][i]._position[0];
					if(this._troops[k][i]._position[0]<miny) miny = this._troops[k][i]._position[0];
					if(this._troops[k][i]._position[1]>maxx) maxx = this._troops[k][i]._position[1];
					if(this._troops[k][i]._position[1]<minx) minx = this._troops[k][i]._position[1];
				}
				if(maxy - miny < this._troops[k].length && maxx - minx < this._troops[k].length)
					target = positionOfWord(tword);
				else
					target = this._troops[k][0]._position;
			}
			else
			{
				target = [base[0],base[1]];
			}
			
			for(var i = 0; i<this._troops[k].length; i++ )
			{
				var h = Math.floor(Math.random() * 5) - 2;
				var v = Math.floor(Math.random() * 5) - 2;
				var word = wordAtPosition([target[0]+v, target[1]+h]);
				var ins = new CustomEvent('instruction',
				{
					'detail' : this._color+" move " + this._troops[k][i]._word + " " + word
				}
				);
				window.dispatchEvent(ins);
			}
		}
	}
}


function swap(arr, n1, n2)
{
	var tmp = arr[n1];
	arr[n1] = arr[n2];
	arr[n2] = tmp;
}
