//this probably looks like a mess because I have no idea how to explain how this works with text alone

const refresh = require("libraries/refresh");

const intervalSize = 4;

const laserSaber = extend(LaserBulletType, {
	length: 150,
	lifetime: 5,
	width: 4,
	damage: 100,
	colors: [Color.red, Color.white, Color.white],
	collidesTiles: true,
	collidesAir: true,
	collidesGround: true,
	absorbable: false,
	hitSound: Sounds.none,
	continuous: true,

	//every 4 units along the laser, this function is called
	saberPoint(b, x, y){
		//searches for bullets that intersect the laser and removes them
		let range = 8;
		let bullets = Groups.bullet.intersect(x - range, y - range, range * 2, range * 2);
		if (bullets != null){
			bullets.each(b => b.remove());
		}
	},

	init(b){
		//I have no idea what this does, but for some reason the game will crash on startup without it
		if(!b) {return;}
		this.super$init(b);

		//divide the laser length by the intervalSize and round to get how many intervals are needed
		let intervals = Mathf.round(laserSaber.length/intervalSize);
		for (var i = 0; i < intervals; i++) {

			//moves further up the laser every loop
			let radius = (i * intervalSize);
			//for some reason, arc trig is in radians while b.rotation() is degrees so we need to convert to radians
			let theta = b.rotation() * (Math.PI/180);

			//convert to cartesian so that the effect can be called by a coordinate
			let x = radius * Math.cos(theta) + b.x;
			let y = radius * Math.sin(theta) + b.y;
			//calls the function that removes intersecting bullets
			this.saberPoint(b, x, y);
		}
	}
});

const saberWeapon = extend(Weapon, "rejectedustry-saber-weapon", {
	reload: 1,
	x: 0,
	y: 0,
	shootY: 5,
	recoil: 1,
	rotate: true,
	shootSound: Sounds.lasershoot,
	shootCone: 360,
	continuous: true,
	bullet: laserSaber,
	alternate: true
});

const dartVader = extend(UnitType, "dart-vader", {
	//these stats are identical to a normal alpha
	flying: true,
	mineSpeed: 6.5,
	mineTier: 1,
	buildSpeed: 0.5,
	drag: 0.05,
	speed: 3,
	rotateSpeed: 15,
	accel: 0.1,
	itemCapacity: 30,
	health: 150,
	engineOffset: 6,
	hitSize: 8,
	commandLimit: 3
});

const shootLock = extend(StatusEffect, "shootLock", {
	isHidden(){
	        return true;
	},

        //all this does is prevent dart vader from shooting while deflecting bullets so that it doesn't look like he has two sabers
	reloadMultiplier: 0,
});

dartVader.constructor = () => extend(UnitEntity, {
	//automatically shoots down nearby bullets when called
	fireNewLaser(targetBullet){
		//creates a laser identical to the laser fired from the weapon, but angled toward the target bullet
		laserSaber.create(this, this.team,
        	this.x + Angles.trnsx(this.rotation, 5),
        	this.y + Angles.trnsy(this.rotation, 5),
        	this.angleTo(targetBullet) );
		//rotates the unit to make it look like it fired the laser
		this.rotation = this.angleTo(targetBullet);
		//status effect prevents normal shooting to give the illusion that the weapon is being autocontrolled
		this.apply(shootLock, 1);
	},

	update(){
		let range1 = laserSaber.length/3;
		let range2 = laserSaber.length;
		let aimbotCone = 90;
		let targetBullet1 = Groups.bullet.intersect(this.x - range1, this.y - range1, range1 * 2, range1 * 2).min(b => b.team != this.team, b => b.dst2(this));
		let targetBullet2 = Groups.bullet.intersect(this.x - range2, this.y - range2, range2 * 2, range2 * 2).min(b => b.team != this.team, b => b.dst2(this));	
		//there are two bullet targeting systems; the first simply detects if a bullet is too close		
		if (targetBullet1 != null) {
			this.fireNewLaser(targetBullet1);
		//if there are no bullets nearby, the radius increases but the targeting is limited to only bullets inside its cone
		} else if (targetBullet2 != null && Math.abs(this.angleTo(targetBullet2) - this.mounts[0].rotation) < aimbotCone) {//for some reason this code sometimes fails to trigger but it's usually not that big of a deal
			this.fireNewLaser(targetBullet2);
		}
		
		this.super$update();
	},
	classId: () => dartVader.classId
});
refresh(dartVader);
dartVader.weapons.addAll(saberWeapon);
