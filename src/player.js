class Player
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.xPrev = 0;
        this.yPrev = 0;
        this.boxSize = 12;
        this.speed = difficultyMode === 0 ? 250 : 400;
        this.maxButtonClickLookBackTime = 0.2;
        this.lastLeftButtonClickedDeltaTime = Number.MAX_SAFE_INTEGER;
        this.curLineDist = 0;
        this.curLevelGroup = 0;
        this.curState = this.onLineUpdate;
        this.jumpVel = {x:0, y:0};
        this.jumpSpeed = 1500;
        this.isJumping = false;
        this.isDead = false;
        this.angle = 0;
        this.rotSpeed = 180;
    }

    update(deltaTime)
    {
        this.xPrev = this.x;
        this.yPrev = this.y;

        this.angle += this.rotSpeed*deltaTime;

        if (this.curState !== undefined)
        {
            this.curState(deltaTime);
        }
    }

    onLineUpdate(deltaTime)
    {
        this.curLineDist += this.speed*deltaTime;
        if (this.curLineDist < 0.0)
        {
            this.curLineDist += level.totalDistance[this.curLevelGroup];
        }
        this.curLineDist = (this.curLineDist % level.totalDistance[this.curLevelGroup]);
        let posInfo = level.getPosInfo(this.curLevelGroup, this.curLineDist);
        this.x = posInfo.x;
        this.y = posInfo.y;

        // Check for death
        aw.entities.forEach(entity =>
        {
            if (entity instanceof Wall)
            {
                let lineIntersectInfo = getLineIntersectionInfo(this.xPrev, this.yPrev, this.x, this.y, entity.x1, entity.y1, entity.x2, entity.y2);
                if (lineIntersectInfo.intersect)
                {
                    addDeathParticle(lineIntersectInfo.x, lineIntersectInfo.y);
                    this.hit();
                }
            }
        });

        if (!this.isDead)
        {
            this.lastLeftButtonClickedDeltaTime += deltaTime;
            if (aw.mouseLeftButtonJustPressed || aw.keysJustPressed.left || aw.keysJustPressed.right || aw.keysJustPressed.up || aw.keysJustPressed.down || aw.keysJustPressed.space)
            {
                this.lastLeftButtonClickedDeltaTime = 0;
            }

            if (this.lastLeftButtonClickedDeltaTime <= this.maxButtonClickLookBackTime)
            {
                this.jumpVel = {x:posInfo.nx * this.jumpSpeed, y:posInfo.ny * this.jumpSpeed};
                this.speed = -this.speed;

                this.isJumping = true;
                this.curState = this.jumpingUpdate;

                aw.playNote("a", 5, 0.01);
                aw.playNote("a#", 5, 0.01, 0.01);
                aw.playNote("b", 5, 0.01, 0.02);
            }
        }
    }

    jumpingUpdate(deltaTime)
    {
        this.x += this.jumpVel.x * deltaTime;
        this.y += this.jumpVel.y * deltaTime;

        // Check for death
        aw.entities.forEach(entity =>
        {
            if (entity instanceof Wall)
            {
                let lineIntersectInfo = getLineIntersectionInfo(this.xPrev, this.yPrev, this.x, this.y, entity.x1, entity.y1, entity.x2, entity.y2);
                if (lineIntersectInfo.intersect)
                {
                    addDeathParticle(lineIntersectInfo.x, lineIntersectInfo.y);
                    this.hit();
                }
            }
        });
        
        // Off screen?
        if (this.x < -screenWidth*0.5 - this.boxSize || this.x > screenWidth*0.5 + this.boxSize ||
            this.y < -screenHeight*0.5 - this.boxSize || this.y > screenHeight*0.5 + this.boxSize)
        {
            this.hit();
        }

        if (!this.isDead)
        {
            // Check for hitting coins
            aw.entities.forEach(entity =>
            {
                if (entity instanceof Coin)
                {
                    let distToPlayer = distanceToLine(entity.x, entity.y, this.xPrev, this.yPrev, this.x, this.y);
                    if (distToPlayer <= entity.hitSize)
                    {
                        entity.hit();
                    }
                }
            });

            // Check for hitting level again
            let intersectInfo = level.getIntersectionInfo(this.xPrev, this.yPrev, this.x, this.y);
            if (intersectInfo.intersect && (intersectInfo.group !== this.curLevelGroup || Math.abs(this.curLineDist - intersectInfo.distance) > 1.0))
            {
                this.curLineDist = intersectInfo.distance;
                this.curLevelGroup = intersectInfo.group;
                let posInfo = level.getPosInfo(this.curLevelGroup, this.curLineDist);
                this.x = posInfo.x;
                this.y = posInfo.y;
                this.lastLeftButtonClickedDeltaTime = Number.MAX_SAFE_INTEGER;

                this.isJumping = false;
                this.curState = this.onLineUpdate;

                startCameraShake(2.5, 0.15);

                aw.playNote("a", 4, 0.01);
                aw.playNote("a#", 4, 0.01, 0.01);
            }
        }
    }

    deadUpdate()
    {

    }

    render()
    {
        if (!this.isDead)
        {
            aw.ctx.save();
            aw.ctx.translate(this.x, this.y);
            aw.ctx.rotate(this.angle);
            // if (this.curState === this.jumpingUpdate)
            // {
            //     aw.ctx.scale(5.0, 1.0);
            // }
            let lineWidthSave = aw.ctx.lineWidth;
            aw.ctx.lineWidth = 4;
            aw.ctx.strokeStyle = "#08F";
            aw.ctx.shadowColor = "#08F";
            aw.ctx.beginPath();
            aw.ctx.rect(-this.boxSize*0.5, -this.boxSize*0.5, this.boxSize, this.boxSize);
            aw.ctx.stroke();

            // if (this.isJumping)
            // {
            //     let jumpLineLength = 0.1;
            //     aw.ctx.globalAlpha = 0.25
            //     aw.ctx.lineWidth = 2;
            //     aw.ctx.rotate(-this.angle);
            //     aw.ctx.beginPath();
            //     aw.ctx.moveTo(0, 0);
            //     aw.ctx.lineTo(-this.jumpVel.x*jumpLineLength, -this.jumpVel.y*jumpLineLength);
            //     aw.ctx.stroke();
            //     aw.ctx.globalAlpha = 1.0;
            // }

            aw.ctx.restore();
            aw.ctx.lineWidth = lineWidthSave;
        }
    }

    hit()
    {
        lives = Math.max(lives - 1, 0);
        this.isDead = true;
        this.curState = this.deadUpdate;

        startCameraShake(5, 0.2);
        aw.playNote("a", 1, 0.2, 0.0, "square");
        aw.playNoise(0.05);
    }
}