var countries = [];

function isTroopFor(i,j,color) {
	if(i < 0 || i >= fieldHeight) return false;
	if(j < 0 || j >= fieldWidth) return false;
	if(battleField[i][j] == null) return false;
	if(battleField[i][j]._type != "troop") return false;
	return battleField[i][j]._color == color;
}

function BaseAI(color,base,maxGuard,maxTroop1,maxTroop2,maxTroop3,maxTroop4)
{
	this._guards = [];
	this._troops = [[],[],[],[]];
	this._color = color;
	this._maxGuard = maxGuard;
	this._maxTroop = [maxTroop1,maxTroop2,maxTroop3,maxTroop4];
	this._isAttacking = [false,false,false,false];
	this._base = base;
	this._training = battleField[this._base[0]][this._base[1]]._word;
	this.collectTroop();
}

BaseAI.prototype.collectTroop = function() {
	for(var i=0; i<fieldHeight; i++) {
		for(var j=0; j<fieldWidth; j++) {
			troop = battleField[i][j];
			if(isTroopFor(i,j,this._color) && !troop._arranged
				 && troop._trainingBase == this._training) {
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

function dispatchBuildTrainingEvent(color,word) {
	var ins = new CustomEvent('instruction', {
		'detail' : color + " build " + word + " training"
	});
	window.dispatchEvent(ins);
}

function dispatchBuildTowerEvent(color,word) {
	var ins = new CustomEvent('instruction', {
		'detail' : color + " build " + word + " tower"
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

BaseAI.prototype.train = function()
{
	if(this._guards.length < this._maxGuard ||
		arrayLengthLessThan(this._troops,this._maxTroop)) {
		dispatchTrainEvent(this._color,this._training,randomWord());
	}
	
	removeEmptyTroop(this._guards);
	for(var k=0; k<4; k++) {
		removeEmptyTroop(this._troops[k]);
	}
	this.collectTroop();
}

function dispatchMoveEvent(color,word,target) {
	var ins = new CustomEvent('instruction',{'detail':color+" move "+word+" "+target});
	window.dispatchEvent(ins);
}

BaseAI.prototype.defendGuard = function(index,x,y,hold) {
	guard = this._guards[index];
	if(guard == undefined) return;
	if(hold && guard._target != null) return;
	var target = wordAtPosition([this._base[0]+x,this._base[1]+y]);
	dispatchMoveEvent(this._color,guard._word,target);
}

BaseAI.prototype.defendPosition = function(x,y) {
	for(var i=-1; i<=1; i++) {
		for(var j=-1; j<=1; j++) {
			if(this._base[0]+x+j >= 0 && this._base[0]+x+j < fieldHeight &&
				 this._base[1]+y+i >= 0 && this._base[1]+y+i < fieldWidth) {
				if(battleField[this._base[0]+x+j][this._base[1]+y+i]!=null &&
					battleField[this._base[0]+x+j][this._base[1]+y+i]._color != this._color) {
					for(var k=0; k<this._guards.length; k++)
						this.defendGuard(k,x+j,y+i);
				}
			}
		}
	}
}

BaseAI.prototype.defend = function()
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

BaseAI.prototype.getNearestEnemyToBase = function(k) {
	var base = this.troopBase(k);
	return getNearestEnemy(this._color, base);
}

BaseAI.prototype.getNearestEnemyToTroop = function(k) {
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

BaseAI.prototype.getNearestEnemyToTroopOrBase = function(k) {
	var base = this._base;
	var enemy_inbase = getNearestEnemy(this._color, base);
	if(enemy_inbase == null) return null;
	if(Math.abs(enemy_inbase[0] - this._base[0]) < 5 &&
		 Math.abs(enemy_inbase[1] - this._base[1]) < 5) {
		return enemy_inbase;
	}
	return this.getNearestEnemyToTroop(k);
}


BaseAI.prototype.sendTroop = function(k,target) {
	for(var i = 0; i<this._troops[k].length; i++) {
		var h = Math.floor(Math.random() * 5) - 2;
		var v = Math.floor(Math.random() * 5) - 2;
		var word = wordAtPosition([target[0]+v, target[1]+h]);
		dispatchMoveEvent(this._color,this._troops[k][i]._word,word);
	}
}

BaseAI.prototype.troopBase = function(index) {
	return [this._base[0]+((index/2)*2-1)*6,this._base[1]+((index%2)*2-1)*6];
}

BaseAI.prototype.attackTarget = function(targetFunc) {
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
		if(target != null) this.sendTroop(k,target);
	}
}

BaseAI.prototype.defendAttack = function() {
	_this = this;
	this.attackTarget(function (k) {
		return _this.getNearestEnemyToTroopOrBase(k)
	});
}

BaseAI.prototype.attack = function() {
	_this = this;
	this.attackTarget(function (k) {
		return _this.getNearestEnemyToTroop(k);
	});
}

BaseAI.prototype.troopDefend = function() {
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
	for(var n = 1; n < arr.length; n++) {
		var k = Math.floor(Math.random() * (n+1));
		swap(arr,k,n);
	}
}

function ExpandAI(color) {
	this._color = color;
}

function findAllBases(color) {
	var ret = [];
	for(var i = 0; i < fieldHeight; i++) {
		for(var j = 0; j < fieldWidth; j++) {
			if(battleField[i][j] != null) {
				if(battleField[i][j]._type == "training") {
					if(battleField[i][j]._color == color) {
						ret.push([i,j]);
					}
				}
			}
		}
	}
	return ret;
}

function findClosestTrainingPos(bases, threshold) {
	var dist = -1, pos = null, closestBase = null;
	for(var i = 0; i < fieldHeight; i++) {
		for(var j = 0; j < fieldWidth; j++) {
			if(wordAtPosition([i,j]).length <= 4 &&
				(battleField[i][j] == null || battleField[i][j]._type == "troop")) {
				var troop = searchTroop(wordAtPosition([i,j]));
				if(troop != null && troop._color != bases[0]._color) continue;
				var tempdist = -1, temppos = null, tempclosest = null;
				for(var k = 0; k < bases.length; k++) {
					var newdist = Math.abs(bases[k][0]-i) + Math.abs(bases[k][1]-j);
					if(newdist < tempdist || tempdist == -1) {
						tempdist = newdist;
						temppos = [i,j];
						tempclosest = bases[k];
					}
				}
				if(tempdist > threshold && (tempdist < dist || dist == -1)) {
					dist = tempdist;
					pos = temppos;
					closestBase = tempclosest;
				}
			}
		}
	}
	return [pos,closestBase];
}

ExpandAI.prototype.expandTraining = function() {
	var bases = findAllBases(this._color);
	if(bases.length == 0) return;
	var closeTrainingPosBase = findClosestTrainingPos(bases, 8);
	var closestTrainingPos = closeTrainingPosBase[0];
	var closestTrainingBase = closeTrainingPosBase[1];
	if(closestTrainingPos == null) return;
	var word = wordAtPosition([closestTrainingPos[0],closestTrainingPos[1]]);
	var baseWord = wordAtPosition([closestTrainingBase[0],closestTrainingBase[1]]);
	var troop = searchTroop(word);
	if(troop == null) {
		dispatchTrainEvent(this._color,baseWord,word);
	}
}

ExpandAI.prototype.buildTraining = function() {
	for(var i = 0; i < fieldHeight; i++) {
		for(var j = 0; j < fieldWidth; j++) {
			if(battleField[i][j] == null) continue;
			if(battleField[i][j]._color == this._color &&
				 battleField[i][j]._type == "troop" &&
				 battleField[i][j]._word.length <= 4) {
				if(battleField[i][j]._word == wordAtPosition([i,j])) {
					dispatchBuildTrainingEvent(this._color, battleField[i][j]._word);
				} else {
					dispatchMoveEvent(this._color, battleField[i][j]._word, battleField[i][j]._word);
				}
			}
		}
	}
}