function getLineIntersectionInfo(a, b, c, d, p, q, r, s)
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

function closestPointToLine(px, py, x1, y1, x2, y2)
{
    let nx = x2 - x1;
    let ny = y2 - y1;
    let length = Math.sqrt((nx*nx) + (ny*ny));
    nx /= length;
    ny /= length;

    let toPx = px - x1;
    let toPy = py - y1;
    let length2 = Math.sqrt((toPx*toPx) + (toPy*toPy));
    toPx /= length2;
    toPy /= length2;

    let dot = (toPx*nx) + (toPy*ny);
    let cx = x1 + nx*dot*length;
    let cy = y1 + ny*dot*length;

    return {x:cx, y:cy};
}

function distanceToLine(px, py, x1, y1, x2, y2)
{
    let c = closestPointToLine(px, py, x1, y1, x2, y2);

    let dx = px - c.x;
    let dy = py - c.y;
    return Math.sqrt((dx*dx) + (dy*dy));
}
class Player
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.xPrev = 0;
        this.yPrev = 0;
        this.boxSize = 10;
        this.speed = 400;
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

        this.lastLeftButtonClickedDeltaTime += deltaTime;
        if (aw.mouseLeftButtonJustPressed)
        {
            this.lastLeftButtonClickedDeltaTime = 0;
        }

        if (this.lastLeftButtonClickedDeltaTime <= this.maxButtonClickLookBackTime)
        {
            this.jumpVel = {x:posInfo.nx * this.jumpSpeed, y:posInfo.ny * this.jumpSpeed};
            this.speed = -this.speed;

            this.isJumping = true;
            this.curState = this.jumpingUpdate;
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
        lives = Math.max(lives - 1, 0);
        this.isDead = true;
        this.curState = this.deadUpdate;
    }
}
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
class Wall
{
    constructor(x, y, length, angle, rotSpeed, xMove, yMove, moveTime, idleTime)
    {
        this.xCenter = x;
        this.yCenter = y;
        this.length = length;
        this.halfLength = length * 0.5;
        this.angle = angle !== undefined ? angle * Math.PI/180 : 0;
        this.rotSpeed = rotSpeed !== undefined ? rotSpeed * Math.PI/180 : 0;
        this.xMove = xMove !== undefined ? xMove : 0;
        this.yMove = yMove !== undefined ? yMove : 0;
        this.moveTime = moveTime !== undefined ? moveTime : 0;
        this.idleTime = idleTime !== undefined ? idleTime : 0;
        this.curTimer = this.moveTime;
        this.isMoving = true;
        this.moveForward = true;
        this.curMovePct = 0.0;

        this.updateEndPoints();
    }

    update(deltaTime)
    {
        let changed = false;

        if (this.rotSpeed !== 0)
        {
            this.angle += this.rotSpeed*deltaTime;
            changed = true;
        }

        if ((this.xMove !== 0 || this.yMove !== 0) && this.moveTime !== 0)
        {
            if (this.isMoving)
            {
                this.curMovePct = this.moveForward ? 1.0 - (this.curTimer / this.moveTime) : this.curTimer / this.moveTime;
            }
            else
            {
                this.curMovePct = this.moveForward ? 0.0 : 1.0;
            }

            this.curTimer -= deltaTime;
            if (this.curTimer <= 0.0)
            {
                if (this.isMoving)
                {                    
                    this.curTimer = this.idleTime;
                    this.moveForward = !this.moveForward;
                }
                else
                {
                    this.curTimer = this.moveTime;
                }
                this.isMoving = !this.isMoving;
            }

            changed = true;
        }

        if (changed)
        {
            this.updateEndPoints();
        }
    }

    updateEndPoints()
    {
        let xDir = Math.cos(this.angle);
        let yDir = Math.sin(this.angle);

        let xCenterCur = this.xCenter + this.xMove*this.curMovePct;
        let yCenterCur = this.yCenter + this.yMove*this.curMovePct;

        this.x1 = xCenterCur - xDir*this.halfLength;
        this.y1 = yCenterCur - yDir*this.halfLength;
        this.x2 = xCenterCur + xDir*this.halfLength;
        this.y2 = yCenterCur + yDir*this.halfLength;
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
class Level
{
    constructor()
    {
        this.linePoints = [];
        this.segLengths = [];
        this.totalDistance = [];
        this.normals = [];
        this.levelTime = 7.0;
        this.timer = this.levelTime;

        this.addPoints();
        this.createSegments();
        this.addItems();
    }

    addPoints()
    {
    }

    createSegments()
    {
        for (let group = 0; group < this.linePoints.length; group++)
        {
            this.totalDistance.push(0);
            this.segLengths.push([]);
            for (let i = 0; i < this.linePoints[group].length - 1; i++)
            {
                let xDist = this.linePoints[group][i + 1].x - this.linePoints[group][i].x;
                let yDist = this.linePoints[group][i + 1].y - this.linePoints[group][i].y;
                let segDist = Math.sqrt((xDist*xDist) + (yDist*yDist));

                this.totalDistance[group] += segDist;
                this.segLengths[group].push(segDist);
            }

            let xDist = this.linePoints[group][0].x - this.linePoints[group][this.linePoints[group].length - 1].x;
            let yDist = this.linePoints[group][0].y - this.linePoints[group][this.linePoints[group].length - 1].y;
            let segDist = Math.sqrt((xDist*xDist) + (yDist*yDist));

            this.totalDistance[group] += segDist;
            this.segLengths[group].push(segDist);
        }
    }

    addItems()
    {
    }

    update(deltaTime)
    {
        if (hardcoreMode && !this.isComplete() && !player.isDead)
        {
            this.timer = Math.max(this.timer - deltaTime, 0.0);
            if (this.timer <= 0.0)
            {
                player.hit();
            }
        }
    }

    render()
    {
        aw.ctx.lineWidth = 2;
        aw.ctx.strokeStyle = "#FFF";
        aw.ctx.shadowColor = "#FFF";
        for (let group = 0; group < this.linePoints.length; group++)
        {
            aw.ctx.beginPath();
            aw.ctx.moveTo(this.linePoints[group][0].x, this.linePoints[group][0].y);
            for (let i = 1; i < this.linePoints[group].length; i++)
            {
                aw.ctx.lineTo(this.linePoints[group][i].x, this.linePoints[group][i].y);
            }
            aw.ctx.lineTo(this.linePoints[group][0].x, this.linePoints[group][0].y);
            aw.ctx.stroke();
        }
    }

    getStartPos()
    {
        return this.linePoints[0][0];
    }

    getPosInfo(group, distance)
    {
        distance = distance % this.totalDistance[group];

        let curTotalDistance = 0;
        for (let i = 0; i < this.segLengths[group].length; i++)
        {
            let nextTotalDistance = curTotalDistance + this.segLengths[group][i];
            if (distance >= curTotalDistance && distance < nextTotalDistance)
            {
                let ratio = (distance - curTotalDistance) / this.segLengths[group][i];
                let p1 = i;
                let p2 = (i + 1) % this.linePoints[group].length;
                let xInterp = this.linePoints[group][p1].x + (this.linePoints[group][p2].x - this.linePoints[group][p1].x)*ratio;
                let yInterp = this.linePoints[group][p1].y + (this.linePoints[group][p2].y - this.linePoints[group][p1].y)*ratio;

                if (this.normals[group] !== undefined && this.normals[group][i] !== undefined)
                {
                    return {x:xInterp, y:yInterp, nx:this.normals[group][i].x, ny:this.normals[group][i].y};
                }
                else
                {
                    let xDir = (this.linePoints[group][p2].x - this.linePoints[group][p1].x) / this.segLengths[group][i];
                    let yDir = (this.linePoints[group][p2].y - this.linePoints[group][p1].y) / this.segLengths[group][i];
                    return {x:xInterp, y:yInterp, nx:yDir, ny:-xDir};
                }
            }

            curTotalDistance = nextTotalDistance;
        }

        return {x:this.linePoints[0][0].x, y:this.linePoints[0][0].y};
    }

    getIntersectionInfo(x1, y1, x2, y2)
    {
        for (let group = 0; group < this.segLengths.length; group++)
        {
            let curTotalDistance = 0;
            for (let i = 0; i < this.segLengths[group].length; i++)
            {
                let p1 = i;
                let p2 = (i + 1) % this.linePoints[group].length;

                let lineIntersectInfo = getLineIntersectionInfo(x1, y1, x2, y2, this.linePoints[group][p1].x, this.linePoints[group][p1].y, this.linePoints[group][p2].x, this.linePoints[group][p2].y);
                if (lineIntersectInfo.intersect)
                {
                    lineIntersectInfo.distance = curTotalDistance + this.segLengths[group][i]*(1.0 - lineIntersectInfo.time);
                    lineIntersectInfo.group = group;
                    return lineIntersectInfo;
                }

                curTotalDistance += this.segLengths[group][i];
            }
        }

        return {intersect:false};
    }

    isComplete()
    {
        let isComplete = true;
        aw.entities.forEach(entity =>
        {
            if (entity instanceof Coin)
            {
                if (entity.active)
                {
                    isComplete = false;
                }
            }
        });

        return isComplete;
    }
}
class L01 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L02 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-200, y:100});
        this.linePoints[0].push({x:200, y: 100});
        this.linePoints[0].push({x:200, y: -100});
        this.linePoints[0].push({x:-200, y: -100});
    }

    addItems()
    {
        let xCols = [-150, -75, 0, 75, 150];
        let yCols = [-60, -20, 20, 60];
        for (let y = 0; y < yCols.length; y++)
        {
            for (let x = 0; x < xCols.length; x++)
            {
                aw.addEntity(new Coin(xCols[x], yCols[y]));
            }
        }
    }
}
class L03 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        let radius = 150;
        let numPoints = 90;
        let angleStep = (360 / numPoints) * Math.PI/180;
        for (let i = 0; i < numPoints; i++)
        {
            let angle = 360 - (i * angleStep);
            let x = Math.cos(angle) * radius;
            let y = Math.sin(angle) * radius;
            this.linePoints[0].push({x:x, y:y});
        }
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(0, 0, 50, 90, 70));
        aw.addEntity(new Coin(0, 0, 100, 90, 70));
        aw.addEntity(new Coin(0, 0, 50, 270, 70));
        aw.addEntity(new Coin(0, 0, 100, 270, 70));
    }
}
class L04 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-60, y:150});
        this.linePoints[0].push({x:60, y: 150});
        this.linePoints[0].push({x:60, y: -150});
        this.linePoints[0].push({x:-60, y: -150});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(0, -50));

        aw.addEntity(new Wall(-35, 25, 50, 0));
        aw.addEntity(new Wall(35, -25, 50, 0));
        aw.addEntity(new Wall(35, 75, 50, 0));
        aw.addEntity(new Wall(-35, -75, 50, 0));
    }
}
class L05 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-200, y:0});
        this.linePoints[0].push({x:0, y:200});
        this.linePoints[0].push({x:200, y:0});
        this.linePoints[0].push({x:0, y:-200});

        this.levelTime = 12.0;
        this.timer = this.levelTime;
    }

    addItems()
    {
        aw.addEntity(new Wall(0, 0, 250, 0, 40));

        aw.addEntity(new Coin(0, 120));
        aw.addEntity(new Coin(30, 90));
        aw.addEntity(new Coin(60, 60));
        aw.addEntity(new Coin(90, 30));

        aw.addEntity(new Coin(-30, 90));
        aw.addEntity(new Coin(-60, 60));
        aw.addEntity(new Coin(-90, 30));
        aw.addEntity(new Coin(-120, 0));

        aw.addEntity(new Coin(-90, -30));
        aw.addEntity(new Coin(-60, -60));
        aw.addEntity(new Coin(-30, -90));
        aw.addEntity(new Coin(0, -120));

        aw.addEntity(new Coin(30, -90));
        aw.addEntity(new Coin(60, -60));
        aw.addEntity(new Coin(90, -30));
        aw.addEntity(new Coin(120,  0));
    }
}
class L06 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-200, y:200});
        this.linePoints[0].push({x:-50, y: 200});
        this.linePoints[0].push({x:-50, y: 20});
        this.linePoints[0].push({x:200, y: 20});

        this.linePoints[0].push({x:200, y:-200});
        this.linePoints[0].push({x:50, y: -200});
        this.linePoints[0].push({x:50, y: -20});
        this.linePoints[0].push({x:-200, y: -20});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-30, 0));
        aw.addEntity(new Coin(-60, 0));
        aw.addEntity(new Coin(30, 0));
        aw.addEntity(new Coin(60, 0));
        aw.addEntity(new Coin(90, 0));
        aw.addEntity(new Coin(-90, 0));
        aw.addEntity(new Coin(120, 0));
        aw.addEntity(new Coin(-120, 0));

        aw.addEntity(new Wall(-125, 160, 150));
        aw.addEntity(new Wall(125, -160, 150));
        aw.addEntity(new Coin(-125, 180));
        aw.addEntity(new Coin(125, -180));

        aw.addEntity(new Wall(-60, 40, 40, 90));
        aw.addEntity(new Wall(60, -40, 40, 90));
    }
}
class L07 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:50, y:-100});
        this.linePoints[0].push({x:-50, y:-100});
        this.normals.push([]);
        this.normals[0].push({x:0, y:1});
        this.normals[0].push({x:0, y:1});

        this.linePoints.push([]);
        this.linePoints[1].push({x:-125, y:100});
        this.linePoints[1].push({x:-25, y:100});
        this.normals.push([]);
        this.normals[1].push({x:0, y:-1});
        this.normals[1].push({x:0, y:-1});

        this.linePoints.push([]);
        this.linePoints[2].push({x:125, y:100});
        this.linePoints[2].push({x:25, y:100});
        this.normals.push([]);
        this.normals[2].push({x:0, y:-1});
        this.normals[2].push({x:0, y:-1});
    }

    addItems()
    {
        aw.addEntity(new Coin(-35, -50));
        aw.addEntity(new Coin(-35, -25));
        aw.addEntity(new Coin(-35, 0));
        aw.addEntity(new Coin(-35, 25));
        aw.addEntity(new Coin(-35, 50));

        aw.addEntity(new Coin(35, -50));
        aw.addEntity(new Coin(35, -25));
        aw.addEntity(new Coin(35, 0));
        aw.addEntity(new Coin(35, 25));
        aw.addEntity(new Coin(35, 50));
    }
}
class L08 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-250, y:-100});
        this.linePoints[0].push({x:250, y: -100});
        this.normals.push([]);
        this.normals[0].push({x:0, y:1});
        this.normals[0].push({x:0, y:1});

        this.linePoints.push([]);
        this.linePoints[1].push({x:-140, y:100});
        this.linePoints[1].push({x:-110, y:100});
        this.normals.push([]);
        this.normals[1].push({x:0, y:-1});
        this.normals[1].push({x:0, y:-1});

        this.linePoints.push([]);
        this.linePoints[2].push({x:140, y:100});
        this.linePoints[2].push({x:110, y:100});
        this.normals.push([]);
        this.normals[2].push({x:0, y:-1});
        this.normals[2].push({x:0, y:-1});

        this.linePoints.push([]);
        this.linePoints[3].push({x:-15, y:100});
        this.linePoints[3].push({x:15, y:100});
        this.normals.push([]);
        this.normals[3].push({x:0, y:-1});
        this.normals[3].push({x:0, y:-1});

        this.levelTime = 12.0;
        this.timer = this.levelTime;
    }

    addItems()
    {
        aw.addEntity(new Coin(-125, -50));
        aw.addEntity(new Coin(-125, 0));
        aw.addEntity(new Coin(-125, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(0, 50));

        aw.addEntity(new Coin(125, -50));
        aw.addEntity(new Coin(125, 0));
        aw.addEntity(new Coin(125, 50));
    }
}
class L09 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        let radius = 150;
        let numPoints = 90;
        let angleStep = (360 / numPoints) * Math.PI/180;
        for (let i = 0; i < numPoints; i++)
        {
            let angle = 360 - (i * angleStep);
            let x = Math.cos(angle) * radius;
            let y = Math.sin(angle) * radius;
            this.linePoints[0].push({x:x, y:y});
        }

        this.linePoints.push([]);
        radius = 100;
        numPoints = 45;
        angleStep = (360 / numPoints) * Math.PI/180;
        for (let i = 0; i < numPoints; i++)
        {
            let angle = i * angleStep;
            let x = Math.cos(angle) * radius;
            let y = Math.sin(angle) * radius;
            this.linePoints[1].push({x:x, y:y});
        }
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 115));
        aw.addEntity(new Coin(0, 135));

        aw.addEntity(new Coin(0, -115));
        aw.addEntity(new Coin(0, -135));

        aw.addEntity(new Coin(115, 0));
        aw.addEntity(new Coin(135, 0));

        aw.addEntity(new Coin(-115, 0));
        aw.addEntity(new Coin(-135, 0));

        aw.addEntity(new Wall(81, 81, 140, -45));
        aw.addEntity(new Wall(-81, 81, 140, 45));
        aw.addEntity(new Wall(81, -81, 140, 45));
        aw.addEntity(new Wall(-81, -81, 140, -45));
    }
}
class L10 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-300, y:100});
        this.linePoints[0].push({x:-300, y:-100});
        this.normals.push([]);
        this.normals[0].push({x:1, y:0});
        this.normals[0].push({x:1, y:0});

        this.linePoints.push([]);
        this.linePoints[1].push({x:300, y:100});
        this.linePoints[1].push({x:300, y:-100});
        this.normals.push([]);
        this.normals[1].push({x:1, y:0});
        this.normals[1].push({x:1, y:0});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));

        aw.addEntity(new Wall(0, 0, 75, 90, 0, 0, 100, 1.0, 0.5));
    }
}
class L11 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L12 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L13 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L14 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L15 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L16 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L17 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L18 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L19 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class L20 extends Level
{
    addPoints()
    {
        this.linePoints.push([]);
        this.linePoints[0].push({x:-100, y:100});
        this.linePoints[0].push({x:100, y: 100});
        this.linePoints[0].push({x:100, y: -100});
        this.linePoints[0].push({x:-100, y: -100});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(-50, 0));
        aw.addEntity(new Coin(50, 0));
        aw.addEntity(new Coin(-25, 0));
        aw.addEntity(new Coin(25, 0));

        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(-50, 50));
        aw.addEntity(new Coin(50, 50));
        aw.addEntity(new Coin(-25, 50));
        aw.addEntity(new Coin(25, 50));

        aw.addEntity(new Coin(0, -50));
        aw.addEntity(new Coin(-50, -50));
        aw.addEntity(new Coin(50, -50));
        aw.addEntity(new Coin(-25, -50));
        aw.addEntity(new Coin(25, -50));
    }
}
class Aw
{
    //////////////////////////
    //-------- CORE --------//
    //////////////////////////

    constructor(width, height, scale, assetList)
    {
        this.initDisplay(width, height, scale);
        this.initEntities();
        this.initInput();
        this.initAudio();

        this.loadAssets(assetList);

        this.gameLoop(performance.now());
    }

    initDisplay(width, height, scale)
    {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", width);
        this.canvas.setAttribute("height", height);
        this.canvas.style.width = `${width * scale}px`;
        this.canvas.style.height = `${height * scale}px`;
        this.canvas.style.backgroundColor = "black";
        //this.canvas.style["image-rendering"] = "pixelated";
        document.getElementById("game").appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.scale = scale;
    }

    loadAssets(assetList)
    {
        this.assets = {};

        assetList.forEach(assetName =>
        {
            this.assets[assetName] = {};
            this.assets[assetName].loaded = false;

            if (assetName.endsWith(".png") || assetName.endsWith(".jpg"))
            {
                this.assets[assetName].data = new Image();
                this.assets[assetName].data.onload = () => this.assets[assetName].loaded = true;
                this.assets[assetName].data.src = assetName;
            }
            else if (assetName.endsWith(".wav") || assetName.endsWith(".mp3"))
            {
                this.assets[assetName].data = new Audio();
                //this.assets[assetName].data.addEventListener("load", () => this.assets[assetName].loaded = true, true);
                this.assets[assetName].data.src = assetName;
                this.assets[assetName].data.load();
                this.assets[assetName].loaded = true;
            }
            else
            {
                console.assert(false, `Unable to load ${assetName} - unknown type`);
            }
        });
    }

    isLoading()
    {
        return Object.keys(this.assets).length > 0 && Object.values(this.assets).every(asset => asset.loaded) == false;
    }

    getAsset(assetName)
    {
        console.assert(this.assets[assetName] !== undefined, `No asset loaded named '${assetName}'`);
        return this.assets[assetName].data;
    }

    gameLoop(curTime)
    {
        window.requestAnimationFrame(this.gameLoop.bind(this));
        
        if (this.isLoading()) { return; }

        let deltaTime = Math.min((curTime - (this.lastTime || curTime)) / 1000.0, 0.2);  // Cap to 200ms (5fps)
        this.lastTime = curTime;

        this.ctx.clearRect(-this.width, -this.height, this.width*2.0, this.height*2.0);

        if (this.state !== undefined)
        {
            this.state(deltaTime);
        }

        this.sortEntities();
        this.updateEntities(deltaTime);
        this.renderEntities();

        if (this.statePost !== undefined)
        {
            this.statePost(deltaTime);
        }

        this.postUpdateInput();
    }

    //////////////////////////
    //------ ENTITIES ------//
    //////////////////////////

    initEntities()
    {
        this.entities = [];
        this.entitiesNeedSorting = false;
        this.entitiesNeedRemoval = false;
    }

    addEntity(entity)
    {
        Object.defineProperty(entity, "z",
        {
            set: (value) =>
            {
                entity._z = value;
                this.entitiesNeedSorting = true;
            },
            get: () => { return entity._z; }
        });
        entity._z = this.entities.length > 0 ? this.entities[this.entities.length - 1].z + 1 : 0;

        this.entities.push(entity);
    }

    removeEntity(entity)
    {
        entity._remove = true;
        this.entitiesNeedRemoval = true;
    }

    updateEntities(deltaTime)
    {
        this.entities.forEach(entity =>
        {
            if (entity.update !== undefined) { entity.update(deltaTime); }
        });

        if (this.entitiesNeedRemoval)
        {
            this.entities = this.entities.filter(entity => entity._remove !== true);
            this.entitiesNeedRemoval = false;
        }
    }

    renderEntities()
    {
        this.entities.forEach(entity =>
        {
            if (entity.render !== undefined) { entity.render(); }
        });
    }

    sortEntities()
    {
        if (this.entitiesNeedSorting)
        {
            // Higher values update/render later than lower values
            this.entities.sort((entity1, entity2) => entity1.z - entity2.z);
            this.entitiesNeedSorting = false;
        }
    }

    clearAllEntities()
    {
        this.entities = [];
    }

    //////////////////////////
    //----- RENDERING ------//
    //////////////////////////

    drawSprite(params)
    {
        // Assumes name, x, and y are defined in params
        let image = this.getAsset(params.name);
        let angle = params.angle !== undefined ? params.angle : 0;
        let width = params.xScale !== undefined ? image.width * params.xScale : image.width;
        let height = params.yScale !== undefined ? image.height * params.yScale : image.height;

        this.ctx.save();
        this.ctx.translate(params.x, params.y);
        this.ctx.rotate(angle * Math.PI/180);
        this.ctx.drawImage(image, -width * 0.5, -height * 0.5, width, height);
        this.ctx.restore();
    }

    drawText(params)
    {
        // Assumes text, x, and y are defined in params
        let angle = params.angle !== undefined ? params.angle * Math.PI/180 : 0;
        let fontName = params.fontName !== undefined ? params.fontName : "Arial";
        let fontSize = params.fontSize !== undefined ? params.fontSize : 12;
        let fontStyle = params.fontStyle !== undefined ? params.fontStyle : "";
        let fillStyle = params.color !== undefined ? params.color : "#FFF";
        let textAlign = params.textAlign !== undefined ? params.textAlign.toLowerCase() : "left";
        let textBaseline = params.textBaseline !== undefined ? params.textBaseline.toLowerCase() : "bottom";

        this.ctx.save();
        this.ctx.translate(params.x, params.y);
        this.ctx.rotate(angle);
        this.ctx.font = `${fontStyle} ${fontSize}px ${fontName}`;
        this.ctx.fillStyle = fillStyle;
        this.ctx.textAlign = textAlign;
        this.ctx.textBaseline = textBaseline;
        this.ctx.fillText(params.text, 0, 0);
        this.ctx.restore();
    }

    ///////////////////////////
    //-------- AUDIO --------//
    ///////////////////////////

    initAudio()
    {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        this.notes =
        {
            "c": 16.35,
            "c#": 17.32,
            "d": 18.35,
            "d#": 19.45,
            "e": 20.60,
            "f": 21.83,
            "f#": 23.12,
            "g": 24.50,
            "g#": 25.96,
            "a": 27.50,
            "a#": 29.14,
            "b": 30.87,
        }
    }

    playAudio(name, loop)
    {
        this.getAsset(name).loop = loop !== undefined ? loop : false;
        this.getAsset(name).play();
    }

    stopAudio(name)
    {
        this.getAsset(name).pause();
        this.getAsset(name).currentTime = 0;
    }

    playNote(note, octave, length)
    {
        let oscillator = this.audioCtx.createOscillator();
        let noteFrequency = this.notes[note.toLowerCase()];
        if (octave !== undefined)
        {
            noteFrequency *= Math.pow(2, octave);
        }

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(noteFrequency, this.audioCtx.currentTime);
        
        oscillator.connect(this.audioCtx.destination);
        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + (length !== undefined ? length : 0.2));  
    }

    ///////////////////////////
    //-------- INPUT --------//
    ///////////////////////////

    initInput()
    {
        this.mousePos = {x: 0, y: 0};
        this.mouseDelta = {x: 0, y: 0};
        this.mouseLeftButton = false;
        this.mouseRightButton = false;
        this.mouseLeftButtonJustPressed = false;
        this.mouseRightButtonJustPressed = false;

        window.addEventListener("mousemove", e =>
        {
            this.mouseDelta.x += e.movementX;
            this.mouseDelta.y += e.movementY;
            this.mousePos = {x: e.clientX, y: e.clientY};
        });

        window.addEventListener("mousedown", e =>
        {
            if (e.button === 0) { this.mouseLeftButton = true; this.mouseLeftButtonJustPressed = true; }
            else if (e.button === 2) { this.mouseRightButton = true; this.mouseRightButtonJustPressed = true; }
        });

        window.addEventListener("mouseup", e =>
        {
            if (e.button === 0) { this.mouseLeftButton = false; }
            else if (e.button === 2) { this.mouseRightButton = false; }
        });

        this.keyToName =
        {
            "a": "a", "b": "b", "c": "c", "d": "d", "e": "e", "f": "f", "g": "g", "h": "h", "i": "i",
            "j": "j", "k": "k", "l": "l", "m": "m", "n": "n", "o": "o", "p": "p", "q": "q", "r": "r",
            "s": "s", "t": "t", "u": "u", "v": "v", "w": "w", "x": "x", "y": "y", "z": "z",
            "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
            "arrowup": "up", "arrowdown": "down", "arrowleft": "left", "arrowright": "right", " ": "space", "escape": "escape",
            "control": "ctrl", "shift": "shift", "alt": "alt", "tab": "tab", "enter": "enter", "backspace": "backspace"
        };

        this.keys = {};
        this.keysJustPressed = {};
        Object.keys(this.keyToName).forEach(key => this.keys[key] = false);

        window.addEventListener("keydown", e =>
        {
            this.setKeyState(e, true);
        });

        window.addEventListener("keyup", e =>
        {
            this.setKeyState(e, false);
        });
    }

    setKeyState(event, isOn)
    {
        let keyCode = event.key.toLowerCase();
        if (this.keyToName[keyCode] !== undefined)
        {
            let keyName = this.keyToName[keyCode];
            this.keysJustPressed[keyName] = this.keys[keyName] === false || this.keys[keyName] === undefined;
            this.keys[keyName] = isOn;
            
            // Hack: prevent arrow keys from scrolling the page
            if (keyName === "up" || keyName === "down" || keyName === "left" || keyName === "right")
            {
                event.preventDefault();
            }
        }
    }

    postUpdateInput()
    {
        this.mouseDelta.x = 0.0;
        this.mouseDelta.y = 0.0;
        this.mouseLeftButtonJustPressed = false;
        this.mouseRightButtonJustPressed = false;

        Object.keys(this.keysJustPressed).forEach(key =>
        {
            this.keysJustPressed[key] = false;
        });
    }
}
var screenWidth = 640;
var screenHeight = 480;
var screenScale = 1.0;

var aw = new Aw(screenWidth, screenHeight, screenScale, []);
aw.state = init;

var level;
var player;
var levelIdx = 9;
var endLevelTime = 0;
var lives = 5;
var hardcoreMode = false;
let levelClassMap =
{
    L01: L01,
    L02: L02,
    L03: L03,
    L04: L04,
    L05: L05,
    L06: L06,
    L07: L07,
    L08: L08,
    L09: L09,
    L10: L10,
    L11: L11,
    L12: L12,
    L13: L13,
    L14: L14,
    L15: L15,
    L16: L16,
    L17: L17,
    L18: L18,
    L19: L19,
    L20: L20,
};

function init()
{
    aw.state = playing;
    aw.statePost = drawUI;

    initLevel(levelIdx);

    aw.ctx.translate(screenWidth*0.5, screenHeight*0.5);
    aw.ctx.scale(1.0, -1.0);
    aw.ctx.shadowBlur = 10;
}

function playing(deltaTime)
{
    if (aw.keysJustPressed.right)
    {
        levelIdx = (levelIdx + 1) % Object.keys(levelClassMap).length;
        initLevel(levelIdx);
    }
    else if (aw.keysJustPressed.left)
    {
        levelIdx--;
        if (levelIdx < 0)
        {
            levelIdx = Object.keys(levelClassMap).length - 1;
        }
        initLevel(levelIdx);
    }
    else if (aw.keysJustPressed.r)
    {
        initLevel(levelIdx);
    }
    else if (aw.keysJustPressed.h)
    {
        hardcoreMode = !hardcoreMode;
        if (hardcoreMode)
        {
            level.timer = level.levelTime;
        }
    }

    if (player.isDead || level.isComplete())
    {
        endLevelTime -= deltaTime;
        if (endLevelTime <= 0.0)
        {
            if (lives === 0)
            {
                aw.state = gameOver;
            }
            else if (player.isDead)
            {
                initLevel(levelIdx);
            }
            else
            {
                levelIdx = (levelIdx + 1) % Object.keys(levelClassMap).length;

                // Give extra life on 10/20/30/etc.
                if ((levelIdx % 10) === 0)
                {
                    lives = Math.min(lives + 1, 5);
                }
                initLevel(levelIdx);
            }
        }
    }
}

function initLevel(idx)
{
    aw.clearAllEntities();

    player = new Player();
    aw.addEntity(player);

    //idx += 1;
    // let levelClassName = `L${idx < 10 ? "0" + idx : idx}`;
    // level = new levelClassMap[levelClassName]();

    // TEMP TO WORK AROUND CLOSURE COMPILER ISSUES
    if (idx == 0) { level = new L01() }
    else if (idx == 1) { level = new L02() }
    else if (idx == 2) { level = new L03() }
    else if (idx == 3) { level = new L04() }
    else if (idx == 4) { level = new L05() }
    else if (idx == 5) { level = new L06() }
    else if (idx == 6) { level = new L07() }
    else if (idx == 7) { level = new L08() }
    else if (idx == 8) { level = new L09() }
    else if (idx == 9) { level = new L10() }
    else if (idx == 10) { level = new L11() }
    else if (idx == 11) { level = new L12() }
    else if (idx == 12) { level = new L13() }
    else if (idx == 13) { level = new L14() }
    else if (idx == 14) { level = new L15() }
    else if (idx == 15) { level = new L16() }
    else if (idx == 16) { level = new L17() }
    else if (idx == 17) { level = new L18() }
    else if (idx == 18) { level = new L19() }
    else if (idx == 19) { level = new L20() }
    aw.addEntity(level);

    endLevelTime = 0.5;
}

function drawUI(deltaTime)
{
    aw.ctx.save();
    aw.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Timer
    if (hardcoreMode)
    {
        let xStart = 10;
        let yStart = screenHeight - 30;
        aw.ctx.fillStyle = "#FFF";
        aw.ctx.fillRect(xStart, yStart, (level.timer / level.levelTime)*(screenWidth - 20), 20);
    }

    // Level #
    aw.ctx.shadowColor = "#FFF";
    aw.drawText({text:`Level ${(levelIdx + 1)}`, x:10, y:30, fontSize:24, fontStyle:"bold"});

    // Lives
    for (let i = 0; i < 5; i++)
    {
        if (i < lives)
        {
            aw.ctx.lineWidth = 3;
            aw.ctx.strokeStyle = "#08F";
            aw.ctx.shadowColor = "#08F";
            aw.ctx.save();
            aw.ctx.translate(540 + i*20, 18);
            aw.ctx.beginPath();
            let boxSize = 10;
            aw.ctx.rect(-boxSize*0.5, -boxSize*0.5, boxSize, boxSize);
            aw.ctx.stroke();
            aw.ctx.restore();
        }
        else
        {
            aw.ctx.shadowColor = "#F00";
            aw.drawText({text:"x", x:536 + i*19.5, y:30, fontSize:24, fontStyle:"bold", color:"#F00"});
        }
    }

    // Game over
    if (lives === 0)
    {
        aw.ctx.shadowColor = "#111";
        aw.ctx.fillStyle = "#111";
        aw.ctx.fillRect(0, 52, screenWidth, 50);

        aw.ctx.shadowColor = "#F00";
        aw.drawText({text:"GAME OVER", x:screenWidth*0.5, y:100, fontSize:40, fontStyle:"bold", color:"#F00", textAlign:"center"});
    }

    aw.ctx.restore();
}

function gameOver(deltaTime)
{
    if (aw.mouseLeftButtonJustPressed)
    {
        lives = 5;
        levelIdx = 0;
        initLevel(levelIdx);
        aw.mouseLeftButtonJustPressed = false;
        aw.state = playing;
    }
}