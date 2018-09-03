var screenWidth = 640;
var screenHeight = 480;
var screenScale = 1.0;

var aw = new Aw(screenWidth, screenHeight, screenScale, []);
aw.state = init;

var level;
var player;
function init()
{
    aw.state = playing;
    
    level = new Level();
    player = new Player();

    aw.addEntity(level);
    aw.addEntity(player);

    aw.ctx.translate(screenWidth*0.5, screenHeight*0.5);
    aw.ctx.scale(1.0, -1.0);
    aw.ctx.shadowBlur = 10;
    aw.ctx.shadowColor = "#08F";
}

function playing()
{
}