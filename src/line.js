class Line
{
    constructor()
    {

    }

    update(deltaTime)
    {

    }

    render()
    {
        // TEMP
        aw.ctx.lineWidth = 2;
        aw.ctx.strokeStyle = "#FFF";
        aw.ctx.beginPath();
        aw.ctx.moveTo(-screenWidth*0.5, 0.0);
        aw.ctx.lineTo(screenWidth*0.5, 0.0);
        aw.ctx.stroke();
    }
}