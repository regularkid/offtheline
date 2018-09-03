class L04 extends Level
{
    addPoints()
    {
        this.linePoints.push({x:-60, y:150});
        this.linePoints.push({x:60, y: 150});
        this.linePoints.push({x:60, y: -150});
        this.linePoints.push({x:-60, y: -150});
    }

    addItems()
    {
        aw.addEntity(new Coin(0, 0));
        aw.addEntity(new Coin(0, 50));
        aw.addEntity(new Coin(0, -50));

        aw.addEntity(new Wall(-40, 25, 40, 0));
        aw.addEntity(new Wall(40, -25, 40, 0));
        aw.addEntity(new Wall(40, 75, 40, 0));
        aw.addEntity(new Wall(-40, -75, 40, 0));
    }
}