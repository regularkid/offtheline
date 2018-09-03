class Coin
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.boxSize = 8;
        this.hitSize = 16;
        this.angle = 0;
        this.rotSpeed = 180;
        this.active = true;
    }

    update(deltaTime)
    {
        this.angle -= this.rotSpeed*deltaTime;

        if (this.active && player.isJumping)
        {
            let distToPlayer = distanceToLine(this.x, this.y, player.xPrev, player.yPrev, player.x, player.y);
            if (distToPlayer <= this.hitSize)
            {
                this.active = false;

                aw.playNote("e", 4, 0.05);
            }
        }
    }

    render()
    {
        if (this.active)
        {
            aw.ctx.save();
            aw.ctx.translate(this.x, this.y);
            aw.ctx.rotate(this.angle * Math.PI/180);
            aw.ctx.lineWidth = 2;
            aw.ctx.strokeStyle = "#FF0";
            aw.ctx.beginPath();
            aw.ctx.rect(-this.boxSize*0.5, -this.boxSize*0.5, this.boxSize, this.boxSize);
            aw.ctx.stroke();
            aw.ctx.restore();
        }
    }
}