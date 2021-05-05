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
    drawCell: false,

    init(){
        if(!this) return;
        this.super$init()
        this.killCooldown = 0;
        this.target = null;
    },

    update(u){
        let aimX = Math.floor(u.mounts[0].aimX);
        let aimY = Math.floor(u.mounts[0].aimY);
        let relativeX = aimX - u.x;
        let relativeY = aimY - u.y;
        this.target = Units.closest(u.team, aimX, aimY, 8, t => {
            return (!t.dead && (t != u)) && Mathf.within(relativeX, relativeY, killRange);
        });

        this.killCooldown--;
        this.killCooldown = Mathf.clamp(this.killCooldown, 0, killCooldown);

        // this can kill multiple units for some reason but i dont give a shit
        if(u.isShooting && (this.target != null) && (this.killCooldown <= 0)){
            this.target.kill();
            u.vel.set(u.vel.x + (relativeX/2), u.vel.y + (relativeY/2));
            this.killCooldown = killCooldown;

            let angle = Angles.angle(u.x, u.y, this.target.x, this.target.y);
            slash.at(this.target.x, this.target.y, angle);
        }
    },

});

amogus.constructor = () => extend(MechUnit, {});

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
