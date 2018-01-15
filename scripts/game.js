var Conjuration = function Conjuration(name, cost, description) {
	this.name = name;
	this.cost = cost;
	this.description = description;
	this.autocast = 0;
	this.timesCast = 0;
};

var Creation = function Creation(name, cost, duration, power,
	powerCost, durationCost, costCost, powerPos, durationNeg, durationPos, costNeg, costPos,
	powerScale, durationScale, costScale) {
	this.name = name;
	this.cost = cost;
	this.duration = duration;
	this.power = power;
	this.powerCost = powerCost;
	this.durationCost = durationCost;
	this.costCost = costCost;
	this.powerPos = powerPos;
	this.durationNeg = durationNeg;
	this.durationPos = durationPos;
	this.costNeg = costNeg;
	this.costPos = costPos;
	this.powerScale = powerScale;
	this.durationScale = durationScale;
	this.costScale = costScale;
	this.description = "";
	this.durationLeft = 0;
	this.timesCast = 0;
	this.powerBoosts = [];
};

var Instant = function Instant(name, power, cost, powerCost, powerPlus, powerScale) {
	this.name = name;
	this.power = power;
	this.cost = cost;
	this.powerCost = powerCost;
	this.powerPlus = powerPlus;
	this.powerScale = powerScale;
	this.timesCast = 0;
	this.powerBoosts = [];
};


var Autocast = function Autocast() {
	this.target = 0;
	this.waitUntilMaxMana = false;
	this.manaLimit = 0;
	this.waitForSpell = 0;
	this.waiting = false;
	this.isOn = false;
};

var manaUpgrades = {
	capUpgMult: 1.235,
	capUpgCostMult: 2,
	regenUpgMult: 1.23,
	regenUpgCostMult: 2
};


game = {
	coins: 0,
	focus: 0,
	maxMana: 100,
	currentMana: 100,
	mps: 2,
	//Arbitrary numbers for now, of course
	capUpgCost: 75,
	regenUpgCost: 100,
	conjurationSpells: {
		createSpell: new Conjuration("Cantio Incantamentum", 50),
		createCaster: new Conjuration("Facio Liber Artifex", 150),
	},
	spells: {
		//name, cost, dur, pow, powCost, durCost, cC, p+, d-, d+, c-, c+ (+ is the nice part of upgrades, - is bad part), pScale, dScale, cS
		coinSpell: new Creation("Fabricatio argentaria", 30, 30, 5, 100, 150, 200, 3, 3, 4, 6, 3, 1.2, 1.2, 1.4),
		focusSpell: new Creation("Focus creo", 50, 20, 2, 300, 500, 700, 1, 2, 3, 10, 5, 1.2, 1.2, 1.4),
		coinMultSpell: new Creation("Multiplicationem fab.", 70, 10, 2, 700, 1000, 1300, 1, 1, 2, 14, 7, 1.2, 1.2, 1.4),
		focusMultSpell: new Creation("Multiplicationem creo", 80, 10, 2, 800, 1200, 1600, 1, 1, 2, 16, 8, 1.2, 1.2, 1.4),
		//name, pow, cost, pCost, p+, pScale
		skipTimeSpell: new Instant("Aevum Praetervehor", 5, 15, 1000, 5, 1.5)
	},
	lastSpell: 0,
	nextBoost: "",
	autoCasters: [],
	options: {
		notation: "Standard",
	},
	lastUpdate: new Date().getTime()
};
var defaultStart = JSON.parse(JSON.stringify(game));
game.lastSpell = game.spells.coinSpell;

function get_save(name) {
	if (localStorage.getItem("SpellMasterSave") !== null) {
		return JSON.parse(atob(localStorage.getItem(name)));
	}
}

function save() {
	localStorage.setItem('SpellMasterSave', btoa(JSON.stringify(game)));
}

function load() {
	var save = JSON.parse(atob(localStorage.getItem("SpellMasterSave")));
	if (!save) return;
	game = save;
	if (game.spells.focusMultSpell === undefined) game.spells.focusMultSpell = new Creation("Multiplicationem creo", 80, 10, 2, 800, 1200, 1600);
	onLoad();
}

function onLoad() {
	var casts = game.conjurationSpells.createSpell.timesCast;
	var selects = document.getElementsByClassName("targetSelect");
	var i, select, opt;
	if (casts >= 1) {
		show("Creation");
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

	if (casts >= 4) {
		document.getElementById("Enhancion").style.display = "block";
		for (i = 0; i < selects.length; i++) {
			select = selects[i];
			opt = document.createElement('option');
			opt.value = "coinMultSpell";
			opt.innerHTML = game.spells.coinMultSpell.name;
			select.appendChild(opt);
		}
	}

	if (casts >= 3) document.getElementById("createCaster").style.display = "inline-block";

	if (casts >= 5) {
		document.getElementById("focusMult").style.display = "inline-block";
		for (i = 0; i < selects.length; i++) {
			select = selects[i];
			opt = document.createElement('option');
			opt.value = "focusMultSpell";
			opt.innerHTML = game.spells.focusMultSpell.name;
			select.appendChild(opt);
		}
	}

	for (i = 1; i <= game.conjurationSpells.createCaster.timesCast; i++) {
		document.getElementById("caster" + i).style.display = "inline-block";
		var caster = game.autoCasters[i - 1];
		if (caster.isOn) {
			changeClass(i + "isOn", "casterBtnOn");
			changeText(i + "isOn", "Activated");
		}
		var count;

		if (caster.waitUntilMaxMana) {
			changeClass(i + "fullmana", "casterBtnOn");
		}
		show("Autocasters");
		var target = document.getElementById(i + "target");
		count = 1;
		for (var property in game.spells) {
			if (caster.target == property) {
				target.selectedIndex = count;
				break;
			}
			count++;
		}
		if (caster.waiting) {
			changeClass(i + "waitfor", "casterBtnOn");
			changeText(i + "waitfor", "Casting only when");
		}

		if (caster.waitForSpell % 1 !== 0) {
			var waitfor = document.getElementById(i + "waitforTarget");
			count = 1;
			for (property in game.spells) {
				if (caster.waitForSpell == property) {
					waitfor.selectedIndex = count;
					break;
				}
				count++;
			}
		}
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

var FormatList = ['', 'K', 'M', 'B', 'T', 'Qd', 'Qt', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QdDc', 'QtDc', 'SxDc', 'SpDc', 'ODc', 'NDc',
									'Vg', 'UVg', 'DVg', 'TVg', 'QdVg', 'QtVg', 'SxVg', 'SpVg', 'OVg', 'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QdTg', 'QtTg', 'SxTg', 'SpTg', 'OTg', 'NTg',
									'Qa', 'UQa', 'DQa', 'TQa', 'QdQa', 'QtQa', 'SxQa', 'SpQa', 'OQa', 'NQa', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QtQi', 'SxQi', 'SpQi', 'OQi', 'NQi',
									'Se', 'USe', 'DSe', 'TSe', 'QaSe', 'QtSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QtSt', 'SxSt', 'SpSt', 'OSt', 'NSt',
									'Og', 'UOg', 'DOg', 'TOg', 'QdOg', 'QtOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 'DNn', 'TNn', 'QdNn', 'QtNn', 'SxNn', 'SpNn', 'ONn', 'NNn', 'Ce',];

function formatValue(value) {

	if (value >= 1000) {
		var mantissa = value / Math.pow(10, Math.floor(Math.log10(value)));
		var power = Math.floor(Math.log10(value));
		if (game.options.notation === "Scientific") {
			mantissa = mantissa.toFixed(2);
			if (mantissa >= 10) {
				mantissa /= 10;
				power++;
			}
				return (mantissa + "e" + power);
		}

		mantissa = (mantissa * Math.pow(10, power % 3)).toFixed(2);
		if (game.options.notation === "Standard") {
			return mantissa + " " + FormatList[(power - (power % 3)) / 3];
		} else if (game.options.notation === "Engineering") {
			return (mantissa + "ᴇ" + (power - (power % 3)));
		}
	} else if (value < 1000) {
		return (value).toFixed(1);
	}
}

function formatTime(time) {
	if (time >= 31536000) {
			return (time / 31536000.0).toFixed(2) + " years";
	} else if (time >= 86400) {
			return (time / 86400.0).toFixed(2) + " days";
	} else if (time >= 3600) {
			return (time / 3600.0).toFixed(2) + " hours";
	} else if (time >= 60) {
			return (time / 60.0).toFixed(2) + " minutes";
	} else return (time % 60).toFixed(1) + " seconds";
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
			game.conjurationSpells.createSpell.cost = 120;
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
			document.getElementById("createCaster").style.display = "inline-block";
			game.conjurationSpells.createSpell.cost = 150;
			break;

		case 3:
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

		case 4:
			document.getElementById("focusMult").style.display = "inline-block";
			game.conjurationSpells.createSpell.cost = 9999999;
			for (i = 0; i < selects.length; i++) {
				select = selects[i];
				opt = document.createElement('option');
				opt.value = "focusMultSpell";
				opt.innerHTML = game.spells.focusMultSpell.name;
				select.appendChild(opt);
			}
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
	game.conjurationSpells.createCaster.cost *= 3;
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
	game.lastSpell = game.spells.coinSpell;
	updateTimesCast();
}

function makeFocus() {
	if (game.currentMana < game.spells.focusSpell.cost) return false;
	if (game.spells.focusSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.focusSpell.cost;
	game.spells.focusSpell.durationLeft = game.spells.focusSpell.duration;
	game.spells.focusSpell.timesCast++;
	game.lastSpell = game.spells.focusSpell;
	updateTimesCast();
}

function coinMult() {
	if (game.currentMana < game.spells.coinMultSpell.cost) return false;
	if (game.spells.coinMultSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.coinMultSpell.cost;
	game.spells.coinMultSpell.durationLeft = game.spells.coinMultSpell.duration;
	game.spells.coinMultSpell.timesCast++;
	game.lastSpell = game.spells.coinMultSpell;
	updateTimesCast();
	updateSpells();
}

function focusMult() {
	if (game.currentMana < game.spells.focusMultSpell.cost) return false;
	if (game.spells.focusMultSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.focusMultSpell.cost;
	game.spells.focusMultSpell.durationLeft = game.spells.focusMultSpell.duration;
	game.spells.focusMultSpell.timesCast++;
	game.lastSpell = game.spells.focusMultSpell;
	updateTimesCast();
}

function timeWarp() {
	if (game.currentMana < game.spells.skipTimeSpell.cost) return false;
	game.currentMana -= game.spells.skipTimeSpell.cost;
	game.spells.skipTimeSpell.timesCast++;
	updateTimesCast();
	timeToWarp = getSpellPower(game.spells.skipTimeSpell);
	game.coins += getCPS() * timeToWarp;
	game.focus += getFPS() * timeToWarp;
}



function getCPS() {
	coinMultiplier = 1;
	if (game.spells.coinMultSpell.durationLeft !== 0) {
		coinMultiplier = getSpellPower(game.spells.coinMultSpell) * Math.pow(1 + game.spells.coinMultSpell.timesCast / 10, 0.4);
	}
	return getSpellPower(game.spells.coinSpell) * coinMultiplier;
}

function getFPS() {
	focusMultiplier = 1;
	if (game.spells.focusMultSpell.durationLeft !== 0) {
		focusMultiplier = 1 + getSpellPower(game.spells.focusMultSpell) * Math.pow(game.currentMana, 0.4) * 0.025;
	}
	return getSpellPower(game.spells.focusSpell) * focusMultiplier;
}


function getSpellPower(spell) {
	var ret = spell.power;
	for (var i = 0; i < spell.powerBoosts.length; i++) {
		ret *= eval(spell.powerBoosts[i]);
	}
	return ret;
}

function upgradePower(spellName) {
	spellToUp = game.spells[spellName];
	if (game.coins < spellToUp.powerCost) return false;
	if (spellToUp.duration - spellToUp.durationNeg < 1) return false;
	game.coins -= spellToUp.powerCost;
	spellToUp.power += spellToUp.powerPos;
	spellToUp.duration -= spellToUp.durationNeg;
	spellToUp.powerCost *= spellToUp.powerScale;
	updateTooltips();
	updateSpells();
}

function upgradeDuration(spellName) {
	spellToUp = game.spells[spellName];
	if (game.coins < spellToUp.durationCost) return false;
	if (spellToUp.cost + spellToUp.costNeg > game.maxMana) return false;
	game.coins -= spellToUp.durationCost;
	spellToUp.duration += spellToUp.durationPos;
	spellToUp.cost += spellToUp.costNeg;
	spellToUp.durationCost *= spellToUp.durationScale;
	updateTooltips();
	updateSpells();
}

function upgradeCost(spellName) {
	spellToUp = game.spells[spellName];
	if (game.coins < spellToUp.costCost) return false;
	game.coins -= spellToUp.costCost;
	spellToUp.cost -= spellToUp.costPos;
	spellToUp.costCost *= spellToUp.costScale;
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

function upgradeInstant(spellName) {
	spellToUp = game.spells[spellName];
	if (game.coins < spellToUp.powerCost) return false;
	game.coins -= spellToUp.powerCost;
	spellToUp.power += spellToUp.powerPlus;
	spellToUp.powerCost *= spellToUp.powerScale;
	updateTooltips();
	updateSpells();
}


function autoCast(autoCaster) {
	if (!autoCaster.isOn) return;

	var target = game.spells[autoCaster.target];
	if (target % 1 === 0) return;
	if (target.cost > game.currentMana) return;
	if (autoCaster.waitForSpell % 1 !== 0 && autoCaster.waiting) {
		if (game.spells[autoCaster.waitForSpell].durationLeft === 0) return;
	}
	if (autoCaster.waitUntilMaxMana && game.currentMana !== game.maxMana) return;
	if (autoCaster.manaLimit > game.currentMana) return;
	if (target.durationLeft !== 0) return;

	target.durationLeft = target.duration;
	game.currentMana -= target.cost;
	target.timesCast++;
	updateTimesCast();
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
		var target = document.getElementById((i + 1) + "target").value;
		var waitingFor = document.getElementById((i + 1) + "waitforTarget").value;
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
		game = defaultStart;
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

function changeNotation() {
	if (game.options === undefined) game.options = {};
	if (game.options.notation == "Standard") {
		game.options.notation = "Scientific";
	} else if (game.options.notation == "Scientific") {
		game.options.notation = "Engineering";
	} else {
		game.options.notation = "Standard";
	}
	changeText("notationbtn", "Notation: "+game.options.notation);
}

function updateInfo() {
	changeText("manaInfo", "Mana: " + formatValue(game.currentMana) + "/" + formatValue(game.maxMana));
	changeText("mps", formatValue(game.mps) + " mana per second.");
	document.getElementById("currentMana").style.width = game.currentMana * 100 / game.maxMana + "%";

	changeText("coinInfo", "You have " + formatValue(game.coins) + " coins.");
	changeText("cps", (game.spells.coinSpell.durationLeft === 0) ? "0 coins per second." : formatValue(getCPS()) + " coins per second.");

	changeText("focusInfo", "You have " + formatValue(game.focus) + " focus.");
	changeText("fps", (game.spells.focusSpell.durationLeft === 0) ? "0 focus per second." : formatValue(getFPS()) + " focus per second.");
}

function updateSpells() {
	changeText("createSpellCost", "Cost: " + formatValue(game.conjurationSpells.createSpell.cost) + " Mana");
	changeText("createCasterCost", "Cost: " + formatValue(game.conjurationSpells.createCaster.cost) + " Mana");
	changeText("makeCoinsCost", "Cost: " + formatValue(game.spells.coinSpell.cost) + " Mana");
	changeText("makeFocusCost", "Cost: " + formatValue(game.spells.focusSpell.cost) + " Mana");
	changeText("coinMultCost", "Cost: " + formatValue(game.spells.coinMultSpell.cost) + " Mana");
	changeText("focusMultCost", "Cost: " + formatValue(game.spells.focusMultSpell.cost) + " Mana");

	changeText("makeCoinsDescription", "Creates " + formatValue(game.spells.coinSpell.power) + " coins per second");
	changeText("makeFocusDescription", "Creates " + formatValue(game.spells.focusSpell.power) + " focus per second");
	changeText("coinMultDescription", "Multiplies your coin production by " + formatValue(getSpellPower(game.spells.coinMultSpell) * Math.pow(1 + game.spells.coinMultSpell.timesCast / 10, 0.4)) + " (based on times this spell is cast)");
	// focusMultDescription is in the main loop because it depends on current mana
	changeText("timeWarpDescription", "Produces " + formatTime(game.spells.skipTimeSpell.power) + " of Coins and Focus");
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
	spellLock("focusMultbtn", game.currentMana < game.spells.focusMultSpell.cost || game.spells.focusMultSpell.durationLeft !== 0);
	spellLock("timeWarpbtn", game.currentMana < game.spells.skipTimeSpell.cost);

	document.getElementById("manaCapUpg").className = (game.focus < game.capUpgCost) ? "focusLocked" : "focusUpg";
	document.getElementById("manaRegenUpg").className = (game.focus < game.regenUpgCost) ? "focusLocked" : "focusUpg";

	spellUpgLock("makeCoinsPowerUpg", game.coins < game.spells.coinSpell.powerCost || game.spells.coinSpell.duration - game.spells.coinSpell.durationNeg <= 1);
	spellUpgLock("makeCoinsDurationUpg", game.coins < game.spells.coinSpell.durationCost || game.spells.coinSpell.cost + game.spells.coinSpell.costNeg > game.maxMana);
	spellUpgLock("makeCoinsCostUpg", game.coins < game.spells.coinSpell.costCost);

	spellUpgLock("makeFocusPowerUpg", game.coins < game.spells.focusSpell.powerCost || game.spells.focusSpell.duration - game.spells.focusSpell.durationNeg <= 1);
	spellUpgLock("makeFocusDurationUpg", game.coins < game.spells.focusSpell.durationCost || game.spells.focusSpell.cost + game.spells.focusSpell.costNeg > game.maxMana);
	spellUpgLock("makeFocusCostUpg", game.coins < game.spells.focusSpell.costCost);

	spellUpgLock("coinMultPowerUpg", game.coins < game.spells.coinMultSpell.powerCost || game.spells.coinMultSpell.duration - game.spells.coinMultSpell.durationNeg <= 1);
	spellUpgLock("coinMultDurationUpg", game.coins < game.spells.coinMultSpell.durationCost || game.spells.coinMultSpell.cost + game.spells.coinMultSpell.costNeg > game.maxMana);
	spellUpgLock("coinMultCostUpg", game.coins < game.spells.coinMultSpell.costCost);

	spellUpgLock("focusMultPowerUpg", game.coins < game.spells.focusMultSpell.powerCost || game.spells.focusMultSpell.duration - game.spells.focusMultSpell.durationNeg <= 1);
	spellUpgLock("focusMultDurationUpg", game.coins < game.spells.focusMultSpell.durationCost || game.spells.focusMultSpell.cost + game.spells.focusMultSpell.costNeg > game.maxMana);
	spellUpgLock("focusMultCostUpg", game.coins < game.spells.focusMultSpell.costCost);

	spellUpgLock("timeWarpUpg", game.coins < game.spells.skipTimeSpell.powerCost);
}

function durationTextSet(id, spellName) {
	spell = game.spells[spellName];
	str = "Duration: " + ((spell.durationLeft === 0) ? formatTime(spell.duration) : formatTime(spell.durationLeft));
	document.getElementById(id).innerHTML = str;
}

function updateDurations() {
	durationTextSet("makeCoinsDuration", "coinSpell");
	durationTextSet("makeFocusDuration", "focusSpell");
	durationTextSet("coinMultDuration", "coinMultSpell");
	durationTextSet("focusMultDuration", "focusMultSpell");
}

// idPrefix is the beginning of the buttons' ids (i.e. "makeCoins", "coinMult", etc.)
// spellScaling is the object containing the different scalings (i.e. creationUpgrades)
// spellName is the name of the spell in game.spells (i.e. "coinSpell", "focusSpell", etc.)
// Still gotta do coloring in green for good and red for bad
function spellUpgTooltips(idPrefix, spellName) {
	spell = game.spells[spellName];
	//Power, then Duration, then Cost
	document.getElementById(idPrefix + "PowerUpg").setAttribute('ach-tooltip', "Power -> " + formatValue(spell.power + spell.powerPos) + "\nDuration -> " + formatTime(spell.duration - spell.durationNeg) + "\nCost: " + formatValue(spell.powerCost) + " coins");
	document.getElementById(idPrefix + "DurationUpg").setAttribute('ach-tooltip', "Duration -> " + formatTime(spell.duration + spell.durationPos) + "\nMana cost -> " + formatValue(spell.cost + spell.costNeg) + "\nCost: " + formatValue(spell.durationCost) + " coins");
	document.getElementById(idPrefix + "CostUpg").setAttribute('ach-tooltip', "Mana cost -> " + formatValue(spell.cost - spell.costPos) + "\nCost: " + formatValue(spell.costCost) + " coins");
}

function instantUpgTooltip(buttonName, spellName) {
	spell = game.spells[spellName];
	document.getElementById(buttonName).setAttribute('ach-tooltip', "Power -> " + formatValue(spell.power + spell.powerPlus) + "\nCost: " + formatValue(spell.powerCost) + " coins");
}

function updateTooltips() {
	spellUpgTooltips("makeCoins", "coinSpell");
	spellUpgTooltips("makeFocus", "focusSpell");
	spellUpgTooltips("coinMult", "coinMultSpell");
	spellUpgTooltips("focusMult", "focusMultSpell");
	instantUpgTooltip("timeWarpUpg", "skipTimeSpell");

	document.getElementById("manaCapUpg").setAttribute('ach-tooltip', "Mana cap -> " + formatValue(manaUpgrades.capUpgMult * game.maxMana) + "\nCost: " + formatValue(game.capUpgCost) + " focus");
	document.getElementById("manaRegenUpg").setAttribute('ach-tooltip', "Mana regen -> " + formatValue(manaUpgrades.regenUpgMult * game.mps) + "/s\nCost: " + formatValue(game.regenUpgCost) + " focus");
}

function timesCastTextSet(id, spellName) {
	changeText(id, "Times cast: " + game.spells[spellName].timesCast);
}

function updateTimesCast() {
	timesCastTextSet("makeCoinsTimesCast", "coinSpell");
	timesCastTextSet("makeFocusTimesCast", "focusSpell");
	timesCastTextSet("coinMultTimesCast", "coinMultSpell");
	timesCastTextSet("focusMultTimesCast", "focusMultSpell");
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

	if (game.spells.focusMultSpell.durationLeft !== 0) {
		game.spells.focusMultSpell.durationLeft = Math.max(0, game.spells.focusMultSpell.durationLeft - delta);
	}

	for (var i = 0; i < game.spells.length; i++)
		if (game.spells[i].durationLeft === 0) game.spells[i].boosts = [];

	for (i in game.autoCasters) autoCast(game.autoCasters[i]);

	updateInfo();
	updateButtonLocks();
	updateDurations();
	// This depends on current mana, so it has to be updated a lot more often than the rest
	changeText("focusMultDescription", "Multiplies your focus production by " + formatValue(1 + getSpellPower(game.spells.focusMultSpell) * Math.pow(game.currentMana, 0.4) * 0.025) + " (based on current mana)");


	game.lastUpdate = thisUpdate;
}, 50);

setInterval(save, 10000);

load();
updateSpells();
updateTooltips();
updateTimesCast();
