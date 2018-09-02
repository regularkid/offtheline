class Player
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.boxSize = 10;
        this.speed = 200;
        this.maxButtonClickLookBackTime = 0.2;
        this.lastLeftButtonClickedDeltaTime = Number.MAX_SAFE_INTEGER;
        this.curLineDist = 0;
        this.curState = this.onLineUpdate;
        this.jumpVel = {x:0, y:0};
        this.jumpSpeed = 1500;
    }

    update(deltaTime)
    {
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
            this.speed = -this.speed;

            this.curState = this.jumpingUpdate;
        }
    }

    jumpingUpdate(deltaTime)
    {
        let xPrev = this.x;
        let yPrev = this.y;

        this.x += this.jumpVel.x * deltaTime;
        this.y += this.jumpVel.y * deltaTime;

        let intersectInfo = level.getIntersectionInfo(xPrev, yPrev, this.x, this.y);
        if (intersectInfo.intersect)
        {
            this.curLineDist = intersectInfo.distance;
            let posInfo = level.getPosInfo(this.curLineDist);
            this.x = posInfo.x;
            this.y = posInfo.y;
            this.lastLeftButtonClickedDeltaTime = Number.MAX_SAFE_INTEGER;
            this.curState = this.onLineUpdate;
        }
        else if (aw.keysJustPressed.space)
        {
            this.lastLeftButtonClickedDeltaTime = Number.MAX_SAFE_INTEGER;
            this.curState = this.onLineUpdate;
        }
    }

    render()
    {
        aw.ctx.save();
        aw.ctx.translate(this.x, this.y);
        aw.ctx.rotate(this.angle);
        // if (this.curState === this.jumpingUpdate)
        // {
        //     aw.ctx.scale(5.0, 1.0);
        // }
        aw.ctx.lineWidth = 2;
        aw.ctx.strokeStyle = "#08F";
        aw.ctx.beginPath();
        aw.ctx.rect(-this.boxSize*0.5, -this.boxSize*0.5, this.boxSize, this.boxSize);
        aw.ctx.stroke();
        aw.ctx.restore();
    }
}