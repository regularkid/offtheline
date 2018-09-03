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