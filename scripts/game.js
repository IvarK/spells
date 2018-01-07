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
	this.target = 0
	this.waitUntilMaxMana = false
	this.manaLimit = 0
	this.waitForSpell = 0
}

var creationUpgrades = {
	powerUpgPowerMult: 1.2,
	powerUpgDurationMult: 0.9,
	durationUpgDurationMult: 1.2,
	durationUpgCostMult: 1.4,
	costUpgCostMult: 0.9,
	upgradesScaling: 1.3,
	costUpgScaling: 1.5
};

var manaUpgrades = {
	capUpgMult: 2.5,
	capUpgCostMult: 30,
	regenUpgMult: 2,
	regenUpgCostMult: 50
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
	spells: {
		createSpell: new Conjuration("Cantio Incantamentum", 50),
		coinSpell: new Creation("Fabricatio argentaria", 30, 30, 5, 100, 150, 200),
		focusSpell: new Creation("Focus creo", 50, 20, 2, 300, 500, 700)
	},
	lastUpdate: new Date().getTime()
};


function createSpell() {
	if (game.currentMana < game.spells.createSpell.cost) return false;
	game.currentMana -= game.spells.createSpell.cost;

	switch (game.spells.createSpell.timesCast) {
		case 0:
			document.getElementById("Creation").style.display = "block";
			game.spells.createSpell.cost = 100;
			document.getElementById("coinInfoDiv").style.visibility = "visible";
			break;

		case 1:
			document.getElementById("makeFocus").style.display = "inline-block";
			game.spells.createSpell.cost = 150;
			document.getElementById("focusInfoDiv").style.visibility = "visible";
			document.getElementById("focusShop").style.display = "block";
			document.getElementById("focusShop").style.visibility = "visible";
	}
	game.spells.createSpell.timesCast++;
	updateSpells();
}

function makeCoins() {
	if (game.currentMana < game.spells.coinSpell.cost) return false;
	if (game.spells.coinSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.coinSpell.cost;
	game.spells.coinSpell.durationLeft = game.spells.coinSpell.duration;
}

function makeFocus() {
	if (game.currentMana < game.spells.focusSpell.cost) return false;
	if (game.spells.focusSpell.durationLeft !== 0) return false;
	game.currentMana -= game.spells.focusSpell.cost;
	game.spells.focusSpell.durationLeft = game.spells.focusSpell.duration;
}

function getCPS() {
	return game.spells.coinSpell.power;
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
  spellToUp = game.spells[spellName];
  if(game.coins < spellToUp.powerCost) return false;
  game.coins -= spellToUp.powerCost;
  spellToUp.power *= creationUpgrades.powerUpgPowerMult;
  spellToUp.duration *= creationUpgrades.powerUpgDurationMult;
  spellToUp.powerCost *= creationUpgrades.upgradesScaling;
  updateTooltips();
  updateSpells();
}

function upgradeDuration(spellName) {
  spellToUp = game.spells[spellName];
  if(game.coins < spellToUp.durationCost) return false;
  game.coins -= spellToUp.durationCost;
  spellToUp.duration *= creationUpgrades.durationUpgDurationMult;
  spellToUp.cost *= creationUpgrades.durationUpgCostMult;
  spellToUp.durationCost *= creationUpgrades.upgradesScaling;
  updateTooltips();
  updateSpells();
}

function upgradeCost(spellName) {
  spellToUp = game.spells[spellName];
  if(game.coins < spellToUp.costCost) return false;
  game.coins -= spellToUp.costCost;
  spellToUp.cost *= creationUpgrades.costUpgCostMult;
  spellToUp.costCost *= creationUpgrades.upgradesScaling;
  updateTooltips();
  updateSpells();
}


function updateInfo() {
	document.getElementById("manaInfo").innerHTML = "Mana: " + Math.floor(game.currentMana) + "/" + Math.floor(game.maxMana);
	document.getElementById("mps").innerHTML = game.mps + " mana per second.";
	document.getElementById("currentMana").style.width = game.currentMana * 100 / game.maxMana + "%";

	document.getElementById("coinInfo").innerHTML = "You have " + Math.floor(game.coins) + " coins.";
	document.getElementById("cps").innerHTML = (game.spells.coinSpell.durationLeft === 0) ? "0 coins per second." : getCPS().toFixed(1) + " coins per second.";

	document.getElementById("focusInfo").innerHTML = "You have " + Math.floor(game.focus) + " focus.";
	document.getElementById("fps").innerHTML = (game.spells.focusSpell.durationLeft === 0) ? "0 focus per second." : getFPS().toFixed(1) + " focus per second.";
}

function updateSpells() {
	document.getElementById("createSpellCost").innerHTML = "Cost: " + game.spells.createSpell.cost + " Mana";
	document.getElementById("makeCoinsCost").innerHTML = "Cost: " + game.spells.coinSpell.cost + " Mana";
  document.getElementById("makeFocusCost").innerHTML = "Cost: " + game.spells.focusSpell.cost + " Mana";

  document.getElementById("makeCoinsDescription").innerHTML = "Creates " + getCPS().toFixed(1) + " coins per second";
  document.getElementById("makeFocusDescription").innerHTML = "Creates " + getFPS().toFixed(1) + " focus per second";
}

function updateCastButtons() {
	document.getElementById("createSpellbtn").className = (game.currentMana < game.spells.createSpell.cost) ? "castLocked" : "spellCast";
	document.getElementById("makeCoinsbtn").className = (game.currentMana < game.spells.coinSpell.cost || game.spells.coinSpell.durationLeft !== 0) ? "castLocked" : "spellCast";
	document.getElementById("makeFocusbtn").className = (game.currentMana < game.spells.focusSpell.cost || game.spells.focusSpell.durationLeft !== 0) ? "castLocked" : "spellCast";
}

function updateDurations() {
	document.getElementById("makeCoinsDuration").innerHTML = (game.spells.coinSpell.durationLeft === 0) ? "Duration: " + game.spells.coinSpell.duration.toFixed(1) + " seconds." : "Duration: " + game.spells.coinSpell.durationLeft.toFixed(1) + " seconds.";
	document.getElementById("makeFocusDuration").innerHTML = (game.spells.focusSpell.durationLeft === 0) ? "Duration: " + game.spells.focusSpell.duration.toFixed(1) + " seconds." : "Duration: " + game.spells.focusSpell.durationLeft.toFixed(1) + " seconds.";
}



//Change to Power -> New power, Duration -> New duration, etc. with coloring in green for good and red for bad
function updateTooltips() {
	document.getElementById("makeCoinsPowerUpg").setAttribute('ach-tooltip', "Power -> " + (creationUpgrades.powerUpgPowerMult * game.spells.coinSpell.power).toFixed(1) + "\nDuration ->" + (creationUpgrades.powerUpgDurationMult * game.spells.coinSpell.duration).toFixed(1) + "\n Cost: " + game.spells.coinSpell.powerCost.toFixed(0) + " coins");
	document.getElementById("makeCoinsDurationUpg").setAttribute('ach-tooltip', "Duration -> " + (creationUpgrades.durationUpgDurationMult * game.spells.coinSpell.duration).toFixed(1) + "\nMana cost ->" + (creationUpgrades.durationUpgCostMult * game.spells.coinSpell.cost).toFixed(1) + "\n Cost: " + game.spells.coinSpell.durationCost.toFixed(0) + " coins");
	document.getElementById("makeCoinsCostUpg").setAttribute('ach-tooltip', "Mana cost -> " + (creationUpgrades.costUpgCostMult * game.spells.coinSpell.cost).toFixed(1) + "\nCost: " + game.spells.coinSpell.costCost.toFixed(0) + " coins");
	document.getElementById("makeFocusPowerUpg").setAttribute('ach-tooltip', "Power -> " + (creationUpgrades.powerUpgPowerMult * game.spells.focusSpell.power).toFixed(1) + "\nDuration ->" + (creationUpgrades.powerUpgDurationMult * game.spells.focusSpell.duration).toFixed(1) + "\n Cost: " + game.spells.focusSpell.powerCost.toFixed(0) + " coins");
	document.getElementById("makeFocusDurationUpg").setAttribute('ach-tooltip', "Duration -> " + (creationUpgrades.durationUpgDurationMult * game.spells.focusSpell.duration).toFixed(1) + "\nMana cost ->" + (creationUpgrades.durationUpgCostMult * game.spells.focusSpell.cost).toFixed(1) + "\n Cost: " + game.spells.focusSpell.durationCost.toFixed(0) + " coins");
	document.getElementById("makeFocusCostUpg").setAttribute('ach-tooltip', "Mana cost -> " + (creationUpgrades.costUpgCostMult * game.spells.focusSpell.cost).toFixed(1) + "\nCost: " + game.spells.focusSpell.costCost.toFixed(0) + " coins");
	document.getElementById("manaCapUpg").setAttribute('ach-tooltip', "Mana cap -> " + (manaUpgrades.capUpgMult * game.maxMana) + "\nCost: " + game.capUpgCost + " focus");
	document.getElementById("manaRegenUpg").setAttribute('ach-tooltip', "Mana regen -> " + (manaUpgrades.regenUpgMult * game.mps) + "/s\nCost: " + game.regenUpgCost + " focus");
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

	if (game.spells.focusSpell.durationLeft !== 0) {
		game.spells.focusSpell.durationLeft = Math.max(0, game.spells.focusSpell.durationLeft - delta);
		game.focus += getFPS() * delta;
	}

	updateInfo();
	updateCastButtons();
	updateDurations();


	game.lastUpdate = thisUpdate;
}, 50);



updateSpells();
updateTooltips();
