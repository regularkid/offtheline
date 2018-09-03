class Wall
{
    constructor(x, y, length, angle, rotSpeed)
    {
        this.xCenter = x;
        this.yCenter = y;
        this.length = length;
        this.halfLength = length * 0.5;
        this.angle = angle !== undefined ? angle * Math.PI/180 : 0;
        this.rotSpeed = rotSpeed !== undefined ? rotSpeed * Math.PI/180 : 0;

        this.updateEndPoints();
    }

    update(deltaTime)
    {
        if (this.rotSpeed !== 0)
        {
            this.angle += this.rotSpeed*deltaTime;
            this.updateEndPoints();
        }
    }

    updateEndPoints()
    {
        let xDir = Math.cos(this.angle);
        let yDir = Math.sin(this.angle);
        this.x1 = this.xCenter - xDir*this.halfLength;
        this.y1 = this.yCenter - yDir*this.halfLength;
        this.x2 = this.xCenter + xDir*this.halfLength;
        this.y2 = this.yCenter + yDir*this.halfLength;
    }

    render()
    {
        aw.ctx.save();
        aw.ctx.lineWidth = 2;
        aw.ctx.strokeStyle = "#F00";
        aw.ctx.shadowColor = "#F00";
        aw.ctx.beginPath();
        aw.ctx.moveTo(this.x1, this.y1);
        aw.ctx.lineTo(this.x2, this.y2);
        aw.ctx.stroke();
        aw.ctx.restore();
    }
}