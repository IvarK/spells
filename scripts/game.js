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
	this.powerBoosts = []
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
	lastSpell = game.spells.coinSpell,
	nextBoost = "",
	autoCasters: [],
	lastUpdate: new Date().getTime()
};

function get_save(name) {
	if (localStorage.getItem("SpellMasterSave") !== null) {
			return JSON.parse(atob(localStorage.getItem(name)))
	}
}

function save() {
	localStorage.setItem('SpellMasterSave', btoa(JSON.stringify(game)))
}

function load() {
	var save = JSON.parse(atob(localStorage.getItem("SpellMasterSave")))
	if (!save) return
	game = save
	onLoad()
}

function onLoad() {
	var casts = game.conjurationSpells.createSpell.timesCast
	var selects = document.getElementsByClassName("targetSelect");
	var i, select, opt;
	if (casts >= 1) {
		show("Creation")
		document.getElementById("coinInfoDiv").style.visibility = "visible";
		for (i = 0; i < selects.length; i++) {
			select = selects[i];
			opt = document.createElement('option');
			opt.value = "coinSpell";
			opt.innerHTML = game.spells.coinSpell.name;
			select.appendChild(opt);
		}
	}

	if (casts >= 2) {
		document.getElementById("makeFocus").style.display = "inline-block";
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
	}

	if (casts >= 3) {
		document.getElementById("Enhancion").style.display = "block";
		for (i = 0; i < selects.length; i++) {
			select = selects[i];
			opt = document.createElement('option');
			opt.value = "coinMultSpell";
			opt.innerHTML = game.spells.coinMultSpell.name;
			select.appendChild(opt);
		}
	}

	if (casts >= 4) document.getElementById("createCaster").style.display = "inline-block";

	for (i = 0; i<game.conjurationSpells.createCaster.timesCast; i++) {
		document.getElementById("caster" + i).style.display = "inline-block";
		show("Autocasters")
	}

}


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
	game.lastSpell = game.spells.coinSpell
}

function makeFocus() {
	if (game.currentMana < game.spells.focusSpell.cost) return false;
	if (game.spells.focusSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.focusSpell.cost;
	game.spells.focusSpell.durationLeft = game.spells.focusSpell.duration;
	game.spells.focusSpell.timesCast++;
	game.lastSpell = game.spells.focusSpell
}

function coinMult() {
	if (game.currentMana < game.spells.coinMultSpell.cost) return false;
	if (game.spells.coinMultSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.coinMultSpell.cost;
	game.spells.coinMultSpell.durationLeft = game.spells.coinMultSpell.duration;
	game.spells.coinMultSpell.timesCast++;
	game.lastSpell = game.spells.coinMultSpell
}



function getCPS() {
	coinMultiplier = 1;
	if (game.spells.coinMultSpell.durationLeft !== 0) {
		coinMultiplier = getSpellPower(game.spells.coinMultSpell);
	}
	return getSpellPower(game.spells.coinSpell) * coinMultiplier;
}

function getFPS() {
	return getSpellPower(game.spells.focusSpell);
}


function getSpellPower(spell) {
	var ret = spell.power
	for (var i = 0; i<spell.powerBoosts.length; i++) {
			 ret *= eval(spell.powerBoosts[i])
	}
	return ret
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
	if (game.autoCasters[x - 1].waitUntilMaxMana) changeClass(x + "fullmana", "casterBtnOn");
	else changeClass(x + "fullmana", "casterBtnOff");
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

function closeToolTip() {
	document.getElementById("HRCNormal").style.display = "inline-block";
	document.getElementById("HRCAss").style.display = "none";
	var elements = document.getElementsByClassName("popup");
	for (var i = 0; i < elements.length; i++) elements[i].style.display = "none";
}

function showSettings() {
	document.getElementById("settings").style.display = "block";
}

function hardReset() {
	if (document.getElementById("hardResetConfirm").checked) {
		closeToolTip();
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
		var toHide = document.getElementsByClassName("hideOnHardReset");
		for (var i = 0; i < toHide.length; i++) toHide[i].style.visibility = "hidden";
		var toNone = document.getElementsByClassName("noneOnHardReset");
		for (i = 0; i < toNone.length; i++) toNone[i].style.display = "none";
		updateSpells();
		updateTooltips();
	} else {
		document.getElementById("HRCNormal").style.display = "none";
		document.getElementById("HRCAss").style.display = "inline-block";
	}
}

function updateInfo() {
	changeText("manaInfo", "Mana: " + Math.floor(game.currentMana).toFixed(0) + "/" + Math.floor(game.maxMana).toFixed(0));
	changeText("mps", game.mps.toFixed(1) + " mana per second.");
	document.getElementById("currentMana").style.width = game.currentMana * 100 / game.maxMana + "%";

	changeText("coinInfo", "You have " + Math.floor(game.coins) + " coins.");
	changeText("cps", (game.spells.coinSpell.durationLeft === 0) ? "0 coins per second." : getCPS().toFixed(1) + " coins per second.");

	changeText("focusInfo", "You have " + Math.floor(game.focus) + " focus.");
	changeText("fps", (game.spells.focusSpell.durationLeft === 0) ? "0 focus per second." : getFPS().toFixed(1) + " focus per second.");
}

function updateSpells() {
	changeText("createSpellCost", "Cost: " + game.conjurationSpells.createSpell.cost.toFixed(0) + " Mana");
	changeText("createCasterCost", "Cost: " + game.conjurationSpells.createCaster.cost.toFixed(0) + " Mana");
	changeText("makeCoinsCost", "Cost: " + game.spells.coinSpell.cost.toFixed(0) + " Mana");
	changeText("makeFocusCost", "Cost: " + game.spells.focusSpell.cost.toFixed(0) + " Mana");
	changeText("coinMultCost", "Cost: " + game.spells.coinMultSpell.cost.toFixed(0) + " Mana");

	changeText("makeCoinsDescription", "Creates " + game.spells.coinSpell.power.toFixed(1) + " coins per second");
	changeText("makeFocusDescription", "Creates " + getFPS().toFixed(1) + " focus per second");
	changeText("coinMultDescription", "Multiplies your coin production by " + game.spells.coinMultSpell.power.toFixed(1));
}

// Locks spell by the button's id if condition is true
function spellLock(id, condition) {
	document.getElementById(id).className = condition ? "castLocked" : "spellCast";
}

// Same use, but for spell upgrades
function spellUpgLock(id, condition) {
	document.getElementById(id).className = condition ? "spellUpgLocked" : "spellUpg";
}

function updateButtonLocks() {
	spellLock("createSpellbtn", game.currentMana < game.conjurationSpells.createSpell.cost);
	spellLock("createCasterbtn", game.currentMana < game.conjurationSpells.createCaster.cost);
	spellLock("makeCoinsbtn", game.currentMana < game.spells.coinSpell.cost || game.spells.coinSpell.durationLeft !== 0);
	spellLock("makeFocusbtn", game.currentMana < game.spells.focusSpell.cost || game.spells.focusSpell.durationLeft !== 0);
	spellLock("coinMultbtn", game.currentMana < game.spells.coinMultSpell.cost || game.spells.coinMultSpell.durationLeft !== 0);

	document.getElementById("manaCapUpg").className = (game.focus < game.capUpgCost) ? "focusLocked" : "focusUpg";
	document.getElementById("manaRegenUpg").className = (game.focus < game.regenUpgCost) ? "focusLocked" : "focusUpg";

	spellUpgLock("makeCoinsPowerUpg", game.coins < game.spells.coinSpell.powerCost);
	spellUpgLock("makeCoinsDurationUpg", game.coins < game.spells.coinSpell.durationCost);
	spellUpgLock("makeCoinsCostUpg", game.coins < game.spells.coinSpell.costCost);

	spellUpgLock("makeFocusPowerUpg", game.coins < game.spells.focusSpell.powerCost);
	spellUpgLock("makeFocusDurationUpg", game.coins < game.spells.focusSpell.durationCost);
	spellUpgLock("makeFocusCostUpg", game.coins < game.spells.focusSpell.costCost);

	spellUpgLock("coinMultPowerUpg", game.coins < game.spells.coinMultSpell.powerCost);
	spellUpgLock("coinMultDurationUpg", game.coins < game.spells.coinMultSpell.durationCost);
	spellUpgLock("coinMultCostUpg", game.coins < game.spells.coinMultSpell.costCost);
}

function durationTextSet(id, spellName) {
	spell = game.spells[spellName];
	str = "Duration: " + ((spell.durationLeft === 0) ? spell.duration.toFixed(1) : spell.durationLeft.toFixed(1)) + " seconds.";
	document.getElementById(id).innerHTML = str;
}

function updateDurations() {
	durationTextSet("makeCoinsDuration", "coinSpell");
	durationTextSet("makeFocusDuration", "focusSpell");
	durationTextSet("coinMultDuration", "coinMultSpell");
}

// idPrefix is the beginning of the buttons' ids (i.e. "makeCoins", "coinMult", etc.)
// spellScaling is the object containing the different scalings (i.e. creationUpgrades)
// spellName is the name of the spell in game.spells (i.e. "coinSpell", "focusSpell", etc.)
function spellUpgTooltips(idPrefix, spellScaling, spellName) {
	spell = game.spells[spellName];
	//Power, then Duration, then Cost
	document.getElementById(idPrefix + "PowerUpg").setAttribute('ach-tooltip', "Power -> " + (spellScaling.powerUpgPowerMult * spell.power).toFixed(1) + "\nDuration -> " + (spellScaling.powerUpgDurationMult * spell.duration).toFixed(1) + "\nCost: " + spell.powerCost.toFixed(0) + " coins");
	document.getElementById(idPrefix + "DurationUpg").setAttribute('ach-tooltip', "Duration -> " + (spellScaling.durationUpgDurationMult * spell.duration).toFixed(1) + "\nMana cost -> " + (spellScaling.durationUpgCostMult * spell.cost).toFixed(1) + "\nCost: " + spell.durationCost.toFixed(0) + " coins");
	document.getElementById(idPrefix + "CostUpg").setAttribute('ach-tooltip', "Mana cost -> " + (spellScaling.costUpgCostMult * spell.cost).toFixed(1) + "\nCost: " + spell.costCost.toFixed(0) + " coins");
}

//Coloring in green for good and red for bad
function updateTooltips() {
	spellUpgTooltips("makeCoins", creationUpgrades, "coinSpell");
	spellUpgTooltips("makeFocus", creationUpgrades, "focusSpell");
	spellUpgTooltips("coinMult", creationUpgrades, "coinMultSpell");
	
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

	for (var i=0;i<game.spells.length;i++) if (game.spells[i].durationLeft == 0) game.spells[i].boosts = []

	for (var i in game.autoCasters) autoCast(game.autoCasters[i]);

	updateInfo();
	updateButtonLocks();
	updateDurations();


	game.lastUpdate = thisUpdate;
}, 50);

setInterval(save, 10000)

load()
updateSpells();
updateTooltips();
