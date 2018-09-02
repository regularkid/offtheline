class Level
{
    constructor()
    {
        // ALL TEMP/DEBUG
        this.linePoints = [];
        this.linePoints.push({x:-100, y:100});
        this.linePoints.push({x:100, y: 100});
        this.linePoints.push({x:100, y: -100});
        this.linePoints.push({x:-100, y: -100});

        this.segLengths = [];
        this.segLengths.push(200);
        this.segLengths.push(200);
        this.segLengths.push(200);
        this.segLengths.push(200);
        
        this.totalDistance = 800;
    }

    update(deltaTime)
    {

    }

    render()
    {
        aw.ctx.lineWidth = 2;
        aw.ctx.strokeStyle = "#FFF";
        aw.ctx.beginPath();
        aw.ctx.moveTo(this.linePoints[0].x, this.linePoints[0].y);
        for (let i = 1; i < this.linePoints.length; i++)
        {
            aw.ctx.lineTo(this.linePoints[i].x, this.linePoints[i].y);
        }
        aw.ctx.lineTo(this.linePoints[0].x, this.linePoints[0].y);
        aw.ctx.stroke();
    }

    getStartPos()
    {
        return this.linePoints[0];
    }

    getPosInfo(distance)
    {
        distance = distance % this.totalDistance;

        let curTotalDistance = 0;
        for (let i = 0; i < this.segLengths.length; i++)
        {
            let nextTotalDistance = curTotalDistance + this.segLengths[i];
            if (distance >= curTotalDistance && distance < nextTotalDistance)
            {
                let ratio = (distance - curTotalDistance) / this.segLengths[i];
                let p1 = i;
                let p2 = (i + 1) % this.linePoints.length;
                let xInterp = this.linePoints[p1].x + (this.linePoints[p2].x - this.linePoints[p1].x)*ratio;
                let yInterp = this.linePoints[p1].y + (this.linePoints[p2].y - this.linePoints[p1].y)*ratio;

                let xDir = (this.linePoints[p2].x - this.linePoints[p1].x) / this.segLengths[i];
                let yDir = (this.linePoints[p2].y - this.linePoints[p1].y) / this.segLengths[i];
                return {x:xInterp, y:yInterp, nx:yDir, ny:-xDir};
            }

            curTotalDistance = nextTotalDistance;
        }

        return {x:this.linePoints[0].x, y:this.linePoints[0].y};
    }

    getIntersectionInfo(x1, y1, x2, y2)
    {
        let curTotalDistance = 0;
        for (let i = 0; i < this.segLengths.length; i++)
        {
            let p1 = i;
            let p2 = (i + 1) % this.linePoints.length;

            let lineIntersectInfo = this.getLineIntersectionInfo(x1, y1, x2, y2, this.linePoints[p1].x, this.linePoints[p1].y, this.linePoints[p2].x, this.linePoints[p2].y);
            if (lineIntersectInfo.intersect)
            {
                lineIntersectInfo.distance = curTotalDistance + this.segLengths[i]*(1.0 - lineIntersectInfo.time);
                return lineIntersectInfo;
            }

            curTotalDistance += this.segLengths[i];
        }

        return {intersect:false};
    }

    getLineIntersectionInfo(a, b, c, d, p, q, r, s)
    {
        let det, gamma, lambda;
        let info = {intersect:false};
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det !== 0)
        {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            if ((0 < lambda && lambda < 1) && (0 < gamma && gamma < 1))
            {
                info.x = p + (r - p)*gamma;
                info.y = q + (s - q)*gamma;
                info.time = gamma;
                info.intersect = true;
            }
        }

        return info;
    }
}