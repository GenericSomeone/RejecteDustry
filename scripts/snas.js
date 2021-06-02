const refresh = require("libraries/refresh");

const karma = extend(StatusEffect, "karma", {
	update(unit, time){
		this.super$update(unit, time);
		const purpleLayer = new Effect(2, e => {
			//increases the layer so that the purple mask draws over the unit instead of under it		
			let drawingLayer = 0;
			
			if((!unit.isGrounded() && unit.hovering) || unit.flying){
				drawingLayer = Layer.flyingUnit + 1;
			} else {
				drawingLayer = Layer.groundUnit + 1;
			}
			Draw.z(drawingLayer);

			Draw.color(Color.valueOf("ff00ff"), e.fout());
   
			//shoutout to sh1penfire for figuring out how this works, because I couldn't
			let region = e.data[0];
    
			let hitSize = e.data[1];
    		
			//help, how do I make this solid purple
			if(region != null) {
				Draw.rect(region, e.x, e.y, e.rotation - 90);
			}
		})
		purpleLayer.at(unit.x, unit.y, unit.rotation, [unit.type.region, unit.type.hitSize]);
		
		//the longer the effect has before it wears off, the more damage it does
		if (time < 20) {
			unit.damage(1);
		} else {
			unit.damage(time/20);
		}
	},

	isHidden(){
	        return true;
	},

        //the status effect doesn't actually do any base damage; all of it is done through update()
	damage: 0,
	color: Color.valueOf("ff00ff"),
});

//variables can be adjusted to whatever

//how many ticks until another blaster spawns
let requiredCooldown = 15;
//how close an enemy has to be to sans until blasters start spawning
let targetRange = 280;
//how far the blasters themselves can shoot
let blasterRange = 300;

const blasterLaser = extend(LaserBulletType, {
	length: blasterRange,
	lifetime: 60,
	width: 24,
	damage: 1,
	colors: [Color.white, Color.white, Color.white],
	collidesTiles: true,
	collidesAir: true,
	collidesGround: true,
	absorbable: false,
	hitSound: Sounds.none,
	status: karma,
	statusDuration: 180
});

const blasterWeapon = extend(Weapon, "rejectedustry-blaster-weapon", {
	reload: 60,
	x: 0,
	y: 10,
	shootY: 1,
	recoil: 1,
	rotate: true,
	shootSound: Sounds.lasershoot,
	shootCone: 360,
	bullet: blasterLaser
});

const blaster = extendContent(UnitType, "blaster", {
	speed: 0,
	hitSize: 8,
	health: 1000,
	range: 40,
	flying: true,
	shootStatusDuration: 30,
	drawCell: false,
	isCounted: false
});

blaster.constructor = () => extend(UnitEntity, {
	update(){
		this.super$update();
		if (this.customTimer == null) {
			//I had to do this because defining it on init didn't work for some reason
			this.customTimer = 0;
		}
		this.customTimer += 1;

		//snaps the blasters toward enemies
		let target = Units.closestEnemy(this.team, this.x, this.y, targetRange, u => u.checkTarget(true, true));
		if (target != null) {
			this.rotation = this.angleTo(target);
		}

		//blasters remove themselves after 60 ticks, enough to have them find the nearest target and fire once
		if (this.customTimer >= 60) {
			this.remove();
		}
	},
	
	//this was supposed to hide the blaster from the core database but it doesn't for some reason
	hidden(){
		return true;
	},

        //we do this so that the number of blasters on the field is not limited by cores
	cap(){
		return Infinity;
	},

	classId: () => blaster.classId
});
refresh(blaster);
blaster.weapons.addAll(blasterWeapon);

const snas = extend(UnitType, "snas", {
	speed: 1,
	drawCell: false,
	hitSize: 0.1,
	health: 1,
	mechSideSway: 0.25,
	flying: true,
});

snas.constructor = () => extend(UnitEntity, {
	update(){
		this.super$update();
		if (this.currentCooldown == null) {
			//I had to do this because defining it on init didn't work for some reason
			this.currentCooldown = 0;
		}
		this.currentCooldown = Mathf.clamp(this.currentCooldown, 0, requiredCooldown);
		this.currentCooldown += 1;
		let target = Units.closestEnemy(this.team, this.x, this.y, targetRange, u => u.checkTarget(true, true));
		if (target != null && this.currentCooldown >= requiredCooldown) {
			this.currentCooldown = 0;
			//this basically controls the region that sans can spawn blasters; it can be adjusted to be greater (bigger spawn zone) or lower (smaller spawn zone)
			let randomness = 48;
			let spawn = Vars.content.getByName(ContentType.unit, "rejectedustry-blaster").spawn(this.team, this.x - randomness + (2 * Math.random() * randomness), this.y - randomness + (2 * Math.random() * randomness));
		}
	},
	classId: () => snas.classId
});
refresh(snas);
