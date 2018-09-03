class Player
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.xPrev = 0;
        this.yPrev = 0;
        this.boxSize = 10;
        this.speed = 300;
        this.maxButtonClickLookBackTime = 0.2;
        this.lastLeftButtonClickedDeltaTime = Number.MAX_SAFE_INTEGER;
        this.curLineDist = 0;
        this.curState = this.onLineUpdate;
        this.jumpVel = {x:0, y:0};
        this.jumpSpeed = 1500;
        this.isJumping = false;
        this.isDead = false;
    }

    update(deltaTime)
    {
        this.xPrev = this.x;
        this.yPrev = this.y;

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
            this.curLineDist += level.totalDistance;
        }
        this.curLineDist = (this.curLineDist % level.totalDistance);
        let posInfo = level.getPosInfo(this.curLineDist);
        this.x = posInfo.x;
        this.y = posInfo.y;

        this.lastLeftButtonClickedDeltaTime += deltaTime;
        if (aw.mouseLeftButtonJustPressed)
        {
            this.lastLeftButtonClickedDeltaTime = 0;
        }

        if (this.lastLeftButtonClickedDeltaTime <= this.maxButtonClickLookBackTime)
        {
            this.jumpVel = {x:posInfo.nx * this.jumpSpeed, y:posInfo.ny * this.jumpSpeed};

            // let dx = (aw.mousePos.x - screenWidth*0.5) - this.x;
            // let dy = ((screenHeight - aw.mousePos.y) - screenHeight*0.5) - this.y;
            // let dist = Math.sqrt((dx*dx) + (dy*dy));
            // dx /= dist;
            // dy /= dist;
            // this.jumpVel = {x:dx * this.jumpSpeed, y:dy * this.jumpSpeed};

            this.speed = -this.speed;

            this.isJumping = true;
            this.curState = this.jumpingUpdate;
        }
    }

    jumpingUpdate(deltaTime)
    {
        this.x += this.jumpVel.x * deltaTime;
        this.y += this.jumpVel.y * deltaTime;

        let intersectInfo = level.getIntersectionInfo(this.xPrev, this.yPrev, this.x, this.y);
        if (intersectInfo.intersect && Math.abs(this.curLineDist - intersectInfo.distance) > 1.0)
        {
            this.curLineDist = intersectInfo.distance;
            let posInfo = level.getPosInfo(this.curLineDist);
            this.x = posInfo.x;
            this.y = posInfo.y;
            this.lastLeftButtonClickedDeltaTime = Number.MAX_SAFE_INTEGER;

            this.isJumping = false;
            this.curState = this.onLineUpdate;
        }
    }

    render()
    {
        if (!this.isDead)
        {
            aw.ctx.save();
            aw.ctx.translate(this.x, this.y);
            //aw.ctx.rotate(this.angle);
            // if (this.curState === this.jumpingUpdate)
            // {
            //     aw.ctx.scale(5.0, 1.0);
            // }
            aw.ctx.lineWidth = 2;
            aw.ctx.strokeStyle = "#08F";
            aw.ctx.shadowColor = "#08F";
            aw.ctx.beginPath();
            aw.ctx.rect(-this.boxSize*0.5, -this.boxSize*0.5, this.boxSize, this.boxSize);
            aw.ctx.stroke();
            aw.ctx.restore();
        }
    }

    hit()
    {
        this.isDead = true;
    }
}