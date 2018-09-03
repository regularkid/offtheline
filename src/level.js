class Level
{
    constructor()
    {
        this.linePoints = [];

        this.addPoints();
        this.createSegments();
        this.addItems();
    }

    addPoints()
    {
        // this.linePoints.push({x:-100, y:100});
        // this.linePoints.push({x:100, y: 100});
        // this.linePoints.push({x:100, y: -100});
        // this.linePoints.push({x:-100, y: -100});

        // CIRCLE
        // let numPoints = 90;
        // let angleStep = 360 / numPoints;
        // let radius = 100;
        // for (let i = 0; i < numPoints; i++)
        // {
        //     let angle = (360 - (i * angleStep)) * Math.PI/180.0;
        //     let x = Math.cos(angle) * radius;
        //     let y = Math.sin(angle) * radius;
        //     this.linePoints.push({x:x, y:y});
        // }
    }

    createSegments()
    {
        this.segLengths = [];
        this.totalDistance = 0;
        for (let i = 0; i < this.linePoints.length - 1; i++)
        {
            let xDist = this.linePoints[i + 1].x - this.linePoints[i].x;
            let yDist = this.linePoints[i + 1].y - this.linePoints[i].y;
            let segDist = Math.sqrt((xDist*xDist) + (yDist*yDist));

            this.totalDistance += segDist;
            this.segLengths.push(segDist);
        }

        let xDist = this.linePoints[0].x - this.linePoints[this.linePoints.length - 1].x;
        let yDist = this.linePoints[0].y - this.linePoints[this.linePoints.length - 1].y;
        let segDist = Math.sqrt((xDist*xDist) + (yDist*yDist));

        this.totalDistance += segDist;
        this.segLengths.push(segDist);
    }

    addItems()
    {
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

            let lineIntersectInfo = getLineIntersectionInfo(x1, y1, x2, y2, this.linePoints[p1].x, this.linePoints[p1].y, this.linePoints[p2].x, this.linePoints[p2].y);
            if (lineIntersectInfo.intersect)
            {
                lineIntersectInfo.distance = curTotalDistance + this.segLengths[i]*(1.0 - lineIntersectInfo.time);
                return lineIntersectInfo;
            }

            curTotalDistance += this.segLengths[i];
        }

        return {intersect:false};
    }
}