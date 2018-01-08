var Conjuration = function Conjuration(name, cost, description) {
	this.name = name;
	this.cost = cost;
	this.description = description;
	this.autocast = 0;
	this.timesCast = 0;
};

var Creation = function Creation(name, cost, duration, power,
	powerCost, durationCost, costCost) {
	this.name = name;
	this.cost = cost;
	this.duration = duration;
	this.power = power;
	this.powerCost = powerCost;
	this.durationCost = durationCost;
	this.costCost = costCost;
	this.description = "";
	this.durationLeft = 0;
	this.autocast = 0;
	this.timesCast = 0;

};


var Autocast = function Autocast() {
	this.target = 0;
	this.waitUntilMaxMana = false;
	this.manaLimit = 0;
	this.waitForSpell = 0;
	this.waiting = false;
	this.isOn = false;
};

var creationUpgrades = {
	powerUpgPowerMult: 1.2,
	powerUpgDurationMult: 0.9,
	durationUpgDurationMult: 1.3,
	durationUpgCostMult: 1.15,
	costUpgCostMult: 0.9,
	upgradesScaling: 1.3,
	costUpgScaling: 1.5
};

var manaUpgrades = {
	capUpgMult: 1.235,
	capUpgCostMult: 2,
	regenUpgMult: 1.1,
	regenUpgCostMult: 5
};


game = {
	coins: 0,
	focus: 0,
	maxMana: 100,
	currentMana: 100,
	mps: 5,
	//Arbitrary numbers for now, of course
	capUpgCost: 75,
	regenUpgCost: 100,
	conjurationSpells: {
		createSpell: new Conjuration("Cantio Incantamentum", 50),
		createCaster: new Conjuration("Facio Liber Artifex", 150),
	},
	spells: {
		coinSpell: new Creation("Fabricatio argentaria", 30, 30, 5, 100, 150, 200),
		focusSpell: new Creation("Focus creo", 50, 20, 2, 300, 500, 700),
		coinMultSpell: new Creation("Multiplicationem fab.", 70, 10, 2, 700, 1000, 1300),
	},
	autoCasters: [],
	lastUpdate: new Date().getTime()
};


function show(elemName) {
	document.getElementById(elemName).style.display = "block";
}

function hide(elemName) {
	document.getElementById(elemName).style.display = "none";
}

function changeText(elemName, text) {
	document.getElementById(elemName).innerHTML = text;
}

function changeClass(elemName, className) {
	document.getElementById(elemName).className = className;
}

function createSpell() {
	if (game.currentMana < game.conjurationSpells.createSpell.cost) return false;
	game.currentMana -= game.conjurationSpells.createSpell.cost;
	var selects = document.getElementsByClassName("targetSelect");
	var i, select, opt;
	switch (game.conjurationSpells.createSpell.timesCast) {
		case 0:
			document.getElementById("Creation").style.display = "block";
			game.conjurationSpells.createSpell.cost = 100;
			document.getElementById("coinInfoDiv").style.visibility = "visible";
			for (i = 0; i < selects.length; i++) {
				select = selects[i];
				opt = document.createElement('option');
				opt.value = "coinSpell";
				opt.innerHTML = game.spells.coinSpell.name;
				select.appendChild(opt);
			}
			break;
		case 1:
			document.getElementById("makeFocus").style.display = "inline-block";
			game.conjurationSpells.createSpell.cost = 150;
			document.getElementById("focusInfoDiv").style.visibility = "visible";
			document.getElementById("focusShop").style.display = "block";
			document.getElementById("focusShop").style.visibility = "visible";
			for (i = 0; i < selects.length; i++) {
				select = selects[i];
				opt = document.createElement('option');
				opt.value = "focusSpell";
				opt.innerHTML = game.spells.focusSpell.name;
				select.appendChild(opt);
			}
			break;

		case 2:
			document.getElementById("Enhancion").style.display = "block";
			game.conjurationSpells.createSpell.cost = 200;
			for (i = 0; i < selects.length; i++) {
				select = selects[i];
				opt = document.createElement('option');
				opt.value = "coinMultSpell";
				opt.innerHTML = game.spells.coinMultSpell.name;
				select.appendChild(opt);
			}
			break;

		case 3:
			document.getElementById("createCaster").style.display = "inline-block";
			game.conjurationSpells.createSpell.cost = 99999999;
	}
	game.conjurationSpells.createSpell.timesCast++;
	updateSpells();

	/*var selects = document.getElementsByClassName("targetSelect")
	for (i in selects) {
		let select = selects[i]
		for (y in game.spells) {
			var opt = document.createElement('option')
			opt.value = y
			opt.innerHTML = game.spells[y].name
			select.appendChild(opt)
		}
	}

	var selects = document.getElementsByClassName("targetSelect")
	for (i in selects) {
		let select = selects[i]
		var opt = document.createElement('option')
		opt.value = y
		opt.innerHTML = game.spells[y].name
		select.appendChild(opt)

	}*/

}

function createCaster() {
	if (game.currentMana < game.conjurationSpells.createCaster.cost) return false;
	game.currentMana -= game.conjurationSpells.createCaster.cost;
	game.conjurationSpells.createCaster.cost *= 4;
	game.autoCasters.push(new Autocast());
	game.conjurationSpells.createCaster.timesCast++;
	show("Autocasters");
	document.getElementById("caster" + game.conjurationSpells.createCaster.timesCast).style.display = "inline-block";
	updateSpells();
}

function makeCoins() {
	if (game.currentMana < game.spells.coinSpell.cost) return false;
	if (game.spells.coinSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.coinSpell.cost;
	game.spells.coinSpell.durationLeft = game.spells.coinSpell.duration;
	game.spells.coinSpell.timesCast++;
}

function makeFocus() {
	if (game.currentMana < game.spells.focusSpell.cost) return false;
	if (game.spells.focusSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.focusSpell.cost;
	game.spells.focusSpell.durationLeft = game.spells.focusSpell.duration;
	game.spells.focusSpell.timesCast++;
}

function coinMult() {
	if (game.currentMana < game.spells.coinMultSpell.cost) return false;
	if (game.spells.coinMultSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.coinMultSpell.cost;
	game.spells.coinMultSpell.durationLeft = game.spells.coinMultSpell.duration;
	game.spells.coinMultSpell.timesCast++;
}



function getCPS() {
	coinMultiplier = 1;
	if (game.spells.coinMultSpell.durationLeft !== 0) {
		coinMultiplier = game.spells.coinMultSpell.power;
	}
	return game.spells.coinSpell.power * coinMultiplier;
}

function getFPS() {
	return game.spells.focusSpell.power;
}

function upgradePower(spellName) {
	spellToUp = game.spells[spellName];
	if (game.coins < spellToUp.powerCost) return false;
	game.coins -= spellToUp.powerCost;
	spellToUp.power *= creationUpgrades.powerUpgPowerMult;
	spellToUp.duration *= creationUpgrades.powerUpgDurationMult;
	spellToUp.powerCost *= creationUpgrades.upgradesScaling;
	updateTooltips();
	updateSpells();
}

function upgradeDuration(spellName) {
	spellToUp = game.spells[spellName];
	if (game.coins < spellToUp.durationCost) return false;
	game.coins -= spellToUp.durationCost;
	spellToUp.duration *= creationUpgrades.durationUpgDurationMult;
	spellToUp.cost *= creationUpgrades.durationUpgCostMult;
	spellToUp.durationCost *= creationUpgrades.upgradesScaling;
	updateTooltips();
	updateSpells();
}

function upgradeCost(spellName) {
	spellToUp = game.spells[spellName];
	if (game.coins < spellToUp.costCost) return false;
	game.coins -= spellToUp.costCost;
	spellToUp.cost *= creationUpgrades.costUpgCostMult;
	spellToUp.costCost *= creationUpgrades.costUpgScaling;
	updateTooltips();
	updateSpells();
}

function manaCapUpgrade() {
	if (game.focus < game.capUpgCost) return false;
	game.focus -= game.capUpgCost;
	game.maxMana *= manaUpgrades.capUpgMult;
	game.capUpgCost *= manaUpgrades.capUpgCostMult;
	updateTooltips();
}

function manaRegenUpgrade() {
	if (game.focus < game.regenUpgCost) return false;
	game.focus -= game.regenUpgCost;
	game.mps *= manaUpgrades.regenUpgMult;
	game.regenUpgCost *= manaUpgrades.regenUpgCostMult;
	updateTooltips();
}


function autoCast(autoCaster) {
	if (!autoCaster.isOn) return;

	var target = autoCaster.target;
	if (target % 1 === 0) return;
	if (target.cost > game.currentMana) return;
	if (autoCaster.waitForSpell % 1 !== 0) {
		if (autoCaster.waitForSpell.durationLeft === 0) return;
	}
	if (autoCaster.waitUntilMaxMana && game.currentMana !== game.maxMana) return;
	if (autoCaster.manaLimit > game.currentMana) return;
	if (target.durationLeft !== 0) return;

	target.durationLeft = target.duration;
	game.currentMana -= target.cost;
}

function toggleCaster(x) {
	game.autoCasters[x - 1].isOn = !game.autoCasters[x - 1].isOn;
	if (game.autoCasters[x - 1].isOn) {
		changeText(x + "isOn", "Activated");
		changeClass(x + "isOn", "casterBtnOn");
	} else {
		changeText(x + "isOn", "Activate");
		changeClass(x + "isOn", "casterBtnOff");
	}
}

function toggleCasterFullMana(x) {
	game.autoCasters[x - 1].waitUntilMaxMana = !game.autoCasters[x - 1].waitUntilMaxMana;
	if (game.autoCasters[x - 1].waitUntilMaxMana) changeClass(x + "fullmana", "casterBtnOn"); else changeClass(x + "fullmana", "casterBtnOff");
}

function toggleCasterWaitFor(x) {
	game.autoCasters[x - 1].waiting = !game.autoCasters[x - 1].waiting;
	if (game.autoCasters[x - 1].waiting) {
		changeText(x + "waitfor", "Casting only when");
		changeClass(x + "waitfor", "casterBtnOn");
	} else {
		changeText(x + "waitfor", "Cast only when");
		changeClass(x + "waitfor", "casterBtnOff");
	}

}

function updateCasters() {
	for (var i = 0; i < game.autoCasters.length; i++) {
		var target = game.spells[document.getElementById((i + 1) + "target").value];
		var waitingFor = game.spells[document.getElementById((i + 1) + "waitforTarget").value];
		if (target !== undefined) game.autoCasters[i].target = target;
		if (waitingFor !== undefined) game.autoCasters[i].waitForSpell = waitingFor;
	}
}

function updateInfo() {
	document.getElementById("manaInfo").innerHTML = "Mana: " + Math.floor(game.currentMana).toFixed(0) + "/" + Math.floor(game.maxMana).toFixed(0);
	document.getElementById("mps").innerHTML = game.mps.toFixed(1) + " mana per second.";
	document.getElementById("currentMana").style.width = game.currentMana * 100 / game.maxMana + "%";

	document.getElementById("coinInfo").innerHTML = "You have " + Math.floor(game.coins) + " coins.";
	document.getElementById("cps").innerHTML = (game.spells.coinSpell.durationLeft === 0) ? "0 coins per second." : getCPS().toFixed(1) + " coins per second.";

	document.getElementById("focusInfo").innerHTML = "You have " + Math.floor(game.focus) + " focus.";
	document.getElementById("fps").innerHTML = (game.spells.focusSpell.durationLeft === 0) ? "0 focus per second." : getFPS().toFixed(1) + " focus per second.";
}

function updateSpells() {
	document.getElementById("createSpellCost").innerHTML = "Cost: " + game.conjurationSpells.createSpell.cost.toFixed(0) + " Mana";
	document.getElementById("createCasterCost").innerHTML = "Cost: " + game.conjurationSpells.createCaster.cost.toFixed(0) + " Mana";
	document.getElementById("makeCoinsCost").innerHTML = "Cost: " + game.spells.coinSpell.cost.toFixed(0) + " Mana";
	document.getElementById("makeFocusCost").innerHTML = "Cost: " + game.spells.focusSpell.cost.toFixed(0) + " Mana";
	document.getElementById("coinMultCost").innerHTML = "Cost: " + game.spells.coinMultSpell.cost.toFixed(0) + " Mana";

	document.getElementById("makeCoinsDescription").innerHTML = "Creates " + game.spells.coinSpell.power.toFixed(1) + " coins per second";
	document.getElementById("makeFocusDescription").innerHTML = "Creates " + getFPS().toFixed(1) + " focus per second";
	document.getElementById("coinMultDescription").innerHTML = "Multiplies your coin production by " + game.spells.coinMultSpell.power.toFixed(1);
}

function updateButtonLocks() {
	document.getElementById("createSpellbtn").className = (game.currentMana < game.conjurationSpells.createSpell.cost) ? "castLocked" : "spellCast";
	document.getElementById("createCasterbtn").className = (game.currentMana < game.conjurationSpells.createCaster.cost) ? "castLocked" : "spellCast";
	document.getElementById("makeCoinsbtn").className = (game.currentMana < game.spells.coinSpell.cost || game.spells.coinSpell.durationLeft !== 0) ? "castLocked" : "spellCast";
	document.getElementById("makeFocusbtn").className = (game.currentMana < game.spells.focusSpell.cost || game.spells.focusSpell.durationLeft !== 0) ? "castLocked" : "spellCast";
	document.getElementById("coinMultbtn").className = (game.currentMana < game.spells.coinMultSpell.cost || game.spells.coinMultSpell.durationLeft !== 0) ? "castLocked" : "spellCast";

	document.getElementById("manaCapUpg").className = (game.focus < game.capUpgCost) ? "focusLocked" : "focusUpg";
	document.getElementById("manaRegenUpg").className = (game.focus < game.regenUpgCost) ? "focusLocked" : "focusUpg";

	document.getElementById("makeCoinsPowerUpg").className = (game.coins < game.spells.coinSpell.powerCost) ? "spellUpgLocked" : "spellUpg";
	document.getElementById("makeCoinsDurationUpg").className = (game.coins < game.spells.coinSpell.durationCost) ? "spellUpgLocked" : "spellUpg";
	document.getElementById("makeCoinsCostUpg").className = (game.coins < game.spells.coinSpell.costCost) ? "spellUpgLocked" : "spellUpg";

	document.getElementById("makeFocusPowerUpg").className = (game.coins < game.spells.focusSpell.powerCost) ? "spellUpgLocked" : "spellUpg";
	document.getElementById("makeFocusDurationUpg").className = (game.coins < game.spells.focusSpell.durationCost) ? "spellUpgLocked" : "spellUpg";
	document.getElementById("makeFocusCostUpg").className = (game.coins < game.spells.focusSpell.costCost) ? "spellUpgLocked" : "spellUpg";

	document.getElementById("coinMultPowerUpg").className = (game.coins < game.spells.coinMultSpell.powerCost) ? "spellUpgLocked" : "spellUpg";
	document.getElementById("coinMultDurationUpg").className = (game.coins < game.spells.coinMultSpell.durationCost) ? "spellUpgLocked" : "spellUpg";
	document.getElementById("coinMultCostUpg").className = (game.coins < game.spells.coinMultSpell.costCost) ? "spellUpgLocked" : "spellUpg";
}

function updateDurations() {
	document.getElementById("makeCoinsDuration").innerHTML = (game.spells.coinSpell.durationLeft === 0) ? "Duration: " + game.spells.coinSpell.duration.toFixed(1) + " seconds." : "Duration: " + game.spells.coinSpell.durationLeft.toFixed(1) + " seconds.";
	document.getElementById("makeFocusDuration").innerHTML = (game.spells.focusSpell.durationLeft === 0) ? "Duration: " + game.spells.focusSpell.duration.toFixed(1) + " seconds." : "Duration: " + game.spells.focusSpell.durationLeft.toFixed(1) + " seconds.";
	document.getElementById("coinMultDuration").innerHTML = (game.spells.coinMultSpell.durationLeft === 0) ? "Duration: " + game.spells.coinMultSpell.duration.toFixed(1) + " seconds." : "Duration: " + game.spells.coinMultSpell.durationLeft.toFixed(1) + " seconds.";
}



//Coloring in green for good and red for bad
function updateTooltips() {
	document.getElementById("makeCoinsPowerUpg").setAttribute('ach-tooltip', "Power -> " + (creationUpgrades.powerUpgPowerMult * game.spells.coinSpell.power).toFixed(1) + "\nDuration ->" + (creationUpgrades.powerUpgDurationMult * game.spells.coinSpell.duration).toFixed(1) + "\n Cost: " + game.spells.coinSpell.powerCost.toFixed(0) + " coins");
	document.getElementById("makeCoinsDurationUpg").setAttribute('ach-tooltip', "Duration -> " + (creationUpgrades.durationUpgDurationMult * game.spells.coinSpell.duration).toFixed(1) + "\nMana cost ->" + (creationUpgrades.durationUpgCostMult * game.spells.coinSpell.cost).toFixed(1) + "\n Cost: " + game.spells.coinSpell.durationCost.toFixed(0) + " coins");
	document.getElementById("makeCoinsCostUpg").setAttribute('ach-tooltip', "Mana cost -> " + (creationUpgrades.costUpgCostMult * game.spells.coinSpell.cost).toFixed(1) + "\nCost: " + game.spells.coinSpell.costCost.toFixed(0) + " coins");

	document.getElementById("makeFocusPowerUpg").setAttribute('ach-tooltip', "Power -> " + (creationUpgrades.powerUpgPowerMult * game.spells.focusSpell.power).toFixed(1) + "\nDuration ->" + (creationUpgrades.powerUpgDurationMult * game.spells.focusSpell.duration).toFixed(1) + "\n Cost: " + game.spells.focusSpell.powerCost.toFixed(0) + " coins");
	document.getElementById("makeFocusDurationUpg").setAttribute('ach-tooltip', "Duration -> " + (creationUpgrades.durationUpgDurationMult * game.spells.focusSpell.duration).toFixed(1) + "\nMana cost ->" + (creationUpgrades.durationUpgCostMult * game.spells.focusSpell.cost).toFixed(1) + "\n Cost: " + game.spells.focusSpell.durationCost.toFixed(0) + " coins");
	document.getElementById("makeFocusCostUpg").setAttribute('ach-tooltip', "Mana cost -> " + (creationUpgrades.costUpgCostMult * game.spells.focusSpell.cost).toFixed(1) + "\nCost: " + game.spells.focusSpell.costCost.toFixed(0) + " coins");

	document.getElementById("coinMultPowerUpg").setAttribute('ach-tooltip', "Power -> " + (creationUpgrades.powerUpgPowerMult * game.spells.coinMultSpell.power).toFixed(1) + "\nDuration ->" + (creationUpgrades.powerUpgDurationMult * game.spells.coinMultSpell.duration).toFixed(1) + "\n Cost: " + game.spells.coinMultSpell.powerCost.toFixed(0) + " coins");
	document.getElementById("coinMultDurationUpg").setAttribute('ach-tooltip', "Duration -> " + (creationUpgrades.durationUpgDurationMult * game.spells.coinMultSpell.duration).toFixed(1) + "\nMana cost ->" + (creationUpgrades.durationUpgCostMult * game.spells.coinMultSpell.cost).toFixed(1) + "\n Cost: " + game.spells.coinMultSpell.durationCost.toFixed(0) + " coins");
	document.getElementById("coinMultCostUpg").setAttribute('ach-tooltip', "Mana cost -> " + (creationUpgrades.costUpgCostMult * game.spells.coinMultSpell.cost).toFixed(1) + "\nCost: " + game.spells.coinMultSpell.costCost.toFixed(0) + " coins");

	document.getElementById("manaCapUpg").setAttribute('ach-tooltip', "Mana cap -> " + (manaUpgrades.capUpgMult * game.maxMana).toFixed(0) + "\nCost: " + game.capUpgCost + " focus");
	document.getElementById("manaRegenUpg").setAttribute('ach-tooltip', "Mana regen -> " + (manaUpgrades.regenUpgMult * game.mps).toFixed(1) + "/s\nCost: " + game.regenUpgCost + " focus");
}


setInterval(function() {
	thisUpdate = new Date().getTime();
	delta = thisUpdate - game.lastUpdate;
	delta /= 1000;

	game.currentMana = Math.min(game.maxMana, game.currentMana + game.mps * delta);

	if (game.spells.coinSpell.durationLeft !== 0) {
		game.spells.coinSpell.durationLeft = Math.max(0, game.spells.coinSpell.durationLeft - delta);
		game.coins += getCPS() * delta;
	}

	if (game.spells.coinMultSpell.durationLeft !== 0) {
		game.spells.coinMultSpell.durationLeft = Math.max(0, game.spells.coinMultSpell.durationLeft - delta);
	}

	if (game.spells.focusSpell.durationLeft !== 0) {
		game.spells.focusSpell.durationLeft = Math.max(0, game.spells.focusSpell.durationLeft - delta);
		game.focus += getFPS() * delta;
	}

	for (var i in game.autoCasters) autoCast(game.autoCasters[i]);

	updateInfo();
	updateButtonLocks();
	updateDurations();


	game.lastUpdate = thisUpdate;
}, 50);



updateSpells();
updateTooltips();
