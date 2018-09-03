class Coin
{
    constructor(x, y, offset, offsetAngle, offsetRotSpeed)
    {
        this.xCenter = x;
        this.yCenter = y;
        this.x = x;
        this.y = y;
        this.boxSize = 8;
        this.hitSize = 20;
        this.angle = 0;
        this.rotSpeed = 180;
        this.active = true;
        this.offset = offset !== undefined ? offset : 0;
        this.offsetAngle = offsetAngle !== undefined ? (offsetAngle * Math.PI/180) : 0;
        this.offsetRotSpeed = offsetRotSpeed !== undefined ? (offsetRotSpeed * Math.PI/180) : 0;
    }

    update(deltaTime)
    {
        this.angle -= this.rotSpeed*deltaTime;

        if (this.offset !== 0)
        {
            let xOffset = Math.cos(this.offsetAngle);
            let yOffset = Math.sin(this.offsetAngle);
            this.x = this.xCenter + xOffset*this.offset;
            this.y = this.yCenter + yOffset*this.offset;

            if (this.offsetRotSpeed !== 0)
            {
                this.offsetAngle += this.offsetRotSpeed*deltaTime;
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
            aw.ctx.shadowColor = "#FF0";
            aw.ctx.beginPath();
            aw.ctx.rect(-this.boxSize*0.5, -this.boxSize*0.5, this.boxSize, this.boxSize);
            aw.ctx.stroke();
            aw.ctx.restore();
        }
    }

    hit()
    {
        if (this.active)
        {
            this.active = false;
            aw.playNote("g", 7, 0.05);
        }
    }
}