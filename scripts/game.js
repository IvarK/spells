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


game = {
	coins: 0,
	focus: 0,
	maxMana: 100,
	currentMana: 100,
	mps: 5,
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

//Power upg: Power +20%, Duration -10/20%, Cost +40%


function updateInfo() {
	document.getElementById("manaInfo").innerHTML = "Mana: " + Math.floor(game.currentMana) + "/" + Math.floor(game.maxMana);
	document.getElementById("mps").innerHTML = game.mps + " mana per second.";
	document.getElementById("currentMana").style.width = game.currentMana * 100 / game.maxMana + "%";

	document.getElementById("coinInfo").innerHTML = "You have " + Math.floor(game.coins) + " coins.";
	document.getElementById("cps").innerHTML = (game.spells.coinSpell.durationLeft === 0) ? "0 coins per second." : getCPS() + " coins per second.";

	document.getElementById("focusInfo").innerHTML = "You have " + Math.floor(game.focus) + " focus.";
	document.getElementById("fps").innerHTML = (game.spells.focusSpell.durationLeft === 0) ? "0 focus per second." : getFPS() + " focus per second.";
}

function updateSpells() {
	document.getElementById("createSpellCost").innerHTML = "Cost: " + game.spells.createSpell.cost + " Mana";
	document.getElementById("makeCoinsCost").innerHTML = "Cost: " + game.spells.coinSpell.cost + " Mana";
	document.getElementById("makeFocusCost").innerHTML = "Cost: " + game.spells.focusSpell.cost + " Mana";
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

function updateTooltips() {
  document.getElementById("makeCoinsPowerUpg").setAttribute('ach-tooltip', "Power -> ass\nDuration -> ass\nCost:" + game.spells.coinSpell.powerCost + " mana");
  document.getElementById("makeCoinsDurationUpg").setAttribute('ach-tooltip', "Increase Duration, but also increase Cost for " + game.spells.coinSpell.durationCost + " mana");
  document.getElementById("makeCoinsCostUpg").setAttribute('ach-tooltip', "Decrease Cost for " + game.spells.coinSpell.costCost + " mana");
  document.getElementById("makeFocusPowerUpg").setAttribute('ach-tooltip', "Increase Power, but decrease Duration and increase Cost for " + game.spells.focusSpell.powerCost + " mana");
  document.getElementById("makeFocusDurationUpg").setAttribute('ach-tooltip', "Increase Duration, but also increase Cost for " + game.spells.focusSpell.durationCost + " mana");
  document.getElementById("makeFocusCostUpg").setAttribute('ach-tooltip', "Decrease Cost for " + game.spells.focusSpell.costCost + " mana");
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
updateTooltips()