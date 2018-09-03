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