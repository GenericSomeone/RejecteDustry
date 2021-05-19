const refresh = require("libraries/refresh");

// tweak to whatever you want
let killRange = 480;
let killCooldown = 0;

let slash = new Effect(50, e => {
    e.scaled(e.lifetime / 2, s => {
        Draw.color(Color.white, Pal.remove, s.finpow());
        Lines.stroke(2.5 * (1 - s.finpow()));
        Lines.circle(e.x, e.y, 40 * s.finpow());
    });
    
    Draw.color(Color.gray);
    
    Angles.randLenVectors(e.id, 3, 50 * e.finpow(), e.rotation + 45, 15, (x, y) => {
        Fill.circle(e.x + x, e.y + y, 6 * e.fout());
    });
    
    Angles.randLenVectors(e.id, 3, 50 * e.finpow(), e.rotation - 45, 15, (x, y) => {
        Fill.circle(e.x + x, e.y + y, 6 * e.fout());
    });
    
    e.scaled(e.lifetime / 1.5, s => {
        Draw.color(Color.white, Pal.remove, s.fin());
        Drawf.tri(e.x, e.y, 10 * s.fout(), 70, e.rotation);
        Drawf.tri(e.x, e.y, 10 * s.fout(), 20, e.rotation-180);
    });
});

let amogus = extend(UnitType, "amogus", {
    health: 6969,
    hitSize: 16,
    speed: 1,
    drawCell: true,
    killCooldown: 0,
});

amogus.constructor = () => extend(MechUnit, {
    init(){
        if(!this) return;
        this.super$init()
        this.killCooldown = 0;
        this.target = null;
    },

    update(){
	this.super$update();

	//there's a bug here where multiple enemies will screw with the targeting but at this point I don't even care anymore
        let aimX = Math.floor(this.mounts[0].aimX);
        let aimY = Math.floor(this.mounts[0].aimY);
        let relativeX = aimX - this.x;
        let relativeY = aimY - this.y;
        Groups.unit.intersect(aimX, aimY, 8, 8, t => {
    		if (!t.dead && t.team != this.team) {
			if(this.isShooting && (t != null) && (this.killCooldown <= 0) && (Mathf.dst(this.x, this.y, t.aimX, t.aimY) <= killRange) ){
            			this.vel.set(this.vel.x + (relativeX/2), this.vel.y + (relativeY/2));
            			this.killCooldown = killCooldown;

            			let angle = Angles.angle(this.x, this.y, t.x, t.y);
            			slash.at(t.x, t.y, angle);
				t.kill();
        		}
		}
	});

	if (this.killCooldown == null) {
		this.killCooldown = 0;
	}
	
        this.killCooldown--;
        this.killCooldown = Mathf.clamp(this.killCooldown, 0, killCooldown);
    },
classId: () => amogus.classId
});
refresh(amogus);

// code length > readability
// this weapon doesnt even need to fire anything, but it needs a bullet to work
amogus.weapons.add(extend(Weapon, {
    rotate: true,
    mirror: false,
    reload: 600,
    x: 0,
    y: 0,
    shootSound: Sounds.none,
    bullet: extend(BasicBulletType, {
        damage: 0,
        width: 0.1,
        height: 0.1,
        instantDisappear: true,
        speed: 0,
    
        hitEffect: Fx.none,
        shootEffect: Fx.none,
        smokeEffect: Fx.none,
        despawnEffect: Fx.none,
    }),
}));
