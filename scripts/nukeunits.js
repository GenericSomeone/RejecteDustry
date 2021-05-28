const refresh = require("libraries/refresh");

const nuclearCrawler = extend(UnitType, "nuclear-crawler", {
	speed: 1,
	hitSize: 8,
	health: 180,
	mechSideSway: 0.25,
	range: 40
});

nuclearCrawler.constructor = () => extend(UnitEntity, {
	update(){
		if (this.isShooting == true){
			//this is simply a replication of the thorium reactor's explosion
			Sounds.explosionbig.at(this.x, this.y);

			Effect.shake(6, 16, this.x, this.y);
			Fx.nuclearShockwave.at(this.x, this.y);
			for(i = 0; i < 6; i++){
				Time.run(Mathf.random(40), () => {
					Fx.nuclearcloud.at(this.x, this.y)
				});
			}

			for(i = 0; i < 20; i++){
				Time.run(Mathf.random(50), () => {
					Fx.explosion.at(this.x + Mathf.random() * 40 - 20, this.y + Mathf.random() * 40 - 20);
				});
			}

			for(i = 0; i < 70; i++){
				Time.run(Mathf.random(80), () => {
					Fx.explosion.at(this.x + Mathf.random() * 120 - 60, this.y + Mathf.random() * 120 - 60);
				});
			}
			Groups.unit.each(u=>u.kill())

			Groups.build.each(b=>b.kill())
		}
		this.super$update();
	},
	classId: () => nuclearCrawler.classId
});
refresh(nuclearCrawler);
nuclearCrawler.defaultController = () => extend(SuicideAI, {});
