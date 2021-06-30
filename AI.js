var countries = [];

function isTroopFor(i,j,color) {
	if(i < 0 || i >= fieldHeight) return false;
	if(j < 0 || j >= fieldWidth) return false;
	if(battleField[i][j] == null) return false;
	if(battleField[i][j]._type != "troop") return false;
	return battleField[i][j]._color == color;
}

function collectTroopFor(troops,color) {
	for(var i = 0; i < fieldHeight; i++) {
		for(var j = 0; j < fieldWidth; j++) {
			if(isTroopFor(i,j,color)) {
				troops.push(battleField[i][j]);
			}
		}
	}
}

function AI(index,maxGuard,maxTroop1,maxTroop2,maxTroop3,maxTroop4)
{
	this._index = index;
	this._guards = [];
	this._troops = [[],[],[],[]];
	this._color = countries[index][0];
	this._maxGuard = maxGuard;
	this._maxTroop = [maxTroop1,maxTroop2,maxTroop3,maxTroop4];
	this._isAttacking = [false,false,false,false];
	this._base = countries[index][1];
	this._training = battleField[this._base[0]][this._base[1]]._word;
	collectTroopFor(this._troops,this._color);
}

function arrayLengthLessThan(arr1, arr2) {
	for(var i = 0; i < 4; i++) {
		if(arr1[i].length < arr2[i]) return true;
	}
	return false;
}

function dispatchTrainEvent(color,training,word) {
	var ins = new CustomEvent('instruction', {
		'detail' : color + " train " + training + " " + word
	});
	window.dispatchEvent(ins);
}

function arrayRemove(arr, index) {
	if(index >= 0 && index < arr.length) {
		arr[index] = arr[arr.length-1];
		arr.pop();
	}
}

function removeEmptyTroop(arr) {
	for(var i = 0; i < arr.length;) {
		if(arr[i]._word == "")
			arrayRemove(arr,i);
		else
			i++;
	}
}

function tryPush(troop,arr,maxSize) {
	if(arr.length < maxSize) {
		arr.push(troop);
		return true;
	}
	return false;
}

AI.prototype.train = function()
{
	if(this._guards.length < this._maxGuard ||
		arrayLengthLessThan(this._troops,this._maxTroop)) {
		dispatchTrainEvent(this._color,this._training,randomWord());
	}
	
	removeEmptyTroop(this._guards);
	for(var k=0; k<4; k++) {
		removeEmptyTroop(this._troops[k]);
	}
	
	for(var i=0; i<fieldHeight; i++) {
		for(var j=0; j<fieldWidth; j++) {
			troop = battleField[i][j];
			if(isTroopFor(i,j,this._color) && !troop._arranged) {
				tryPushTroop = tryPush.bind(null,troop);
				troop._arranged = tryPushTroop(this._guards,this._maxGuard);
				if(troop._arranged) continue;
				var order = randomOrder(4);
				for(var k = 0; k < 4; k++) {
					kk = order[k];
					troop._arranged = tryPushTroop(this._troops[kk],this._maxTroop[kk]);
					if(troop._arranged) break;
				}
			}
		}
	}
}

function dispatchMoveEvent(color,word,target) {
	var ins = new CustomEvent('instruction',{'detail':color+" move "+word+" "+target});
	window.dispatchEvent(ins);
}

AI.prototype.defendGuard = function(index,x,y,hold) {
	guard = this._guards[index];
	if(guard == undefined) return;
	if(hold && guard._target != null) return;
	var target = wordAtPosition([this._base[0]+x,this._base[1]+y]);
	dispatchMoveEvent(this._color,guard._word,target);
}

AI.prototype.defendPosition = function(x,y) {
	for(var i=-1; i<=1; i++) {
		for(var j=-1; j<=1; j++) {
			if(battleField[this._base[0]+x+j][this._base[1]+y+i]!=null &&
				battleField[this._base[0]+x+j][this._base[1]+y+i]._color != this._color) {
				for(var k=0; k<this._guards.length; k++)
					this.defendGuard(k,x+j,y+i);
			}
		}
	}
}

AI.prototype.defend = function()
{
	this.defendGuard(0,-5,-1,true);
	this.defendGuard(1, 5, 1,true);
	this.defendGuard(2,-1, 5,true);
	this.defendGuard(3, 1,-5,true);
	this.defendGuard(4, 4, 1,false);
	this.defendGuard(5,-4,-1,false);
	this.defendGuard(6, 1, 4,false);
	this.defendGuard(7,-1,-4,false);
	this.defendGuard(8, 4,-1,false);
	this.defendGuard(9,-4, 1,false);
	this.defendGuard(10,-1, 4);
	this.defendGuard(11, 1,-4);
	this.defendPosition(2,0);
	this.defendPosition(-2,0);
	this.defendPosition(0,2);
	this.defendPosition(0,-2);
}

function getBoundary(troop) {
	var minx = fieldWidth, maxx = 0;
	var miny = fieldHeight, maxy = 0;
	for(var i = 0; i < troop.length; i++) {
		if(troop[i]._position[0] > maxy) maxy = troop[i]._position[0];
		if(troop[i]._position[0] < miny) miny = troop[i]._position[0];
		if(troop[i]._position[1] > maxx) maxx = troop[i]._position[1];
		if(troop[i]._position[1] < minx) minx = troop[i]._position[1];
	}
	return [minx,maxx,miny,maxy];
}

function getSpan(troop) {
	boundary = getBoundary(troop);
	return Math.max(boundary[1]-boundary[0],boundary[3]-boundary[2]);
}

function further(base,pos1,pos2) {
	return Math.abs(pos1[0]-base[0])+Math.abs(pos1[1]-base[1]) >
		     Math.abs(pos2[0]-base[0])+Math.abs(pos2[1]-base[1]);
}

function isEnemyOf(color,i,j) {
	return battleField[i][j] != null && battleField[i][j]._color != color;
}

function getNearestEnemy(color,center) {
	var target = null;
	for(var i=0; i<fieldHeight; i++) {
		for(var j=0; j<fieldWidth; j++) {
			if(isEnemyOf(color,i,j) && (target == null || further(center,target,[i,j])))
				target = [i,j];
		}
	}
	return target;
}

AI.prototype.getNearestEnemyToBase = function(k) {
	var base = this.troopBase(k);
	return getNearestEnemy(this._color, base);
}

AI.prototype.getNearestEnemyToTroop = function(k) {
	var centerx = 0, centery = 0;
	var troop = this._troops[k];
	for(var i = 0; i < troop.length; i++) {
		centerx += troop[i]._position[0];
		centery += troop[i]._position[1];
	}
	centerx /= troop.length;
	centery /= troop.length;
	var target = null;
	for(var i=0; i<fieldHeight; i++) {
		for(var j=0; j<fieldWidth; j++) {
			if(isEnemyOf(this._color,i,j) &&
				(target == null || further([centerx,centery],target,[i,j])))
				target = [i,j];
		}
	}
	return target;
}

AI.prototype.getNearestEnemyToTroopOrBase = function(k) {
	var base = this._base;
	var enemy_inbase = getNearestEnemy(this._color, base);
	if(Math.abs(enemy_inbase[0] - this._base[0]) < 5 &&
		 Math.abs(enemy_inbase[1] - this._base[1]) < 5) {
		return enemy_inbase;
	}
	return this.getNearestEnemyToTroop(k);
}


AI.prototype.sendTroop = function(k,target) {
	for(var i = 0; i<this._troops[k].length; i++) {
		var h = Math.floor(Math.random() * 5) - 2;
		var v = Math.floor(Math.random() * 5) - 2;
		var word = wordAtPosition([target[0]+v, target[1]+h]);
		dispatchMoveEvent(this._color,this._troops[k][i]._word,word);
	}
}

AI.prototype.troopBase = function(index) {
	return [this._base[0]+((index/2)*2-1)*6,this._base[1]+((index%2)*2-1)*6];
}

AI.prototype.attackTarget = function(targetFunc) {
	for(var k=0; k<4; k++) {
		if(this._troops[k].length<=0) continue;
		var base = this.troopBase(k);
		var target = null;

		if(this._troops[k].length>=this._maxTroop[k]) this._isAttacking[k] = true;
		if(this._troops[k].length<this._maxTroop[k]/2) this._isAttacking[k] = false;

		if(this._isAttacking[k]) {
			span = getSpan(this._troops[k]);
			if(span < this._troops[k].length)
				target = targetFunc(k);
			else
				target = this._troops[k][0]._position;
		} else {
			target = base;
		}
		this.sendTroop(k,target);
	}
}

AI.prototype.defendAttack = function() {
	_this = this;
	this.attackTarget(function (k) {
		return _this.getNearestEnemyToTroopOrBase(k)
	});
}

AI.prototype.attack = function() {
	_this = this;
	this.attackTarget(function (k) {
		return _this.getNearestEnemyToTroop(k);
	});
}

AI.prototype.troopDefend = function() {
	for(var k=0; k<4; k++) {
		if(this._troops[k].length<=0) continue;
		this.sendTroop(k,this.troopBase(k));
	}
}

function swap(arr, n1, n2) {
	var tmp = arr[n1];
	arr[n1] = arr[n2];
	arr[n2] = tmp;
}

function randomOrder(n) {
	order = [];
	for(var i = 0; i < n; i++)
		order.push(i);
	randomShuffle(order);
	return order;
}

function randomShuffle(arr) {
	for(var n = 1; i < arr.length; i++) {
		var k = Math.floor(Math.random() * (n+1));
		swap(arr,k,n);
	}
}
