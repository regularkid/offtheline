var screenWidth = 640;
var screenHeight = 480;
var screenScale = 1.0;

var aw = new Aw(screenWidth, screenHeight, screenScale, ["CoolmathGames-640x480.png"]);
aw.state = splash;

var level;
var player;
var levelIdx = 0;
var endLevelTime = 0;
var lives = 5;
var difficultyMode = 0;
var splashTime = 1.0;

function splash(deltaTime)
{
    splashTime -= deltaTime;
    if (splashTime <= 0.0)
    {
        aw.state = init;
        aw.mouseLeftButtonJustPressed = false;
        aw.mouseLeftButtonJustUp = false;
    }

    aw.drawSprite({name: "CoolmathGames-640x480.png", x: 320, y: 240});
}

function init(deltaTime)
{
    renderBackgroundSpeedLines(deltaTime);

    if (aw.mouseLeftButtonJustUp)
    {
        aw.state = mainMenu;
        aw.mouseLeftButtonJustPressed = false;
        aw.mouseLeftButtonJustUp = false;

        aw.playNote("a", 4, 0.05, 0.0);
        aw.playNote("b", 4, 0.05, 0.05);
    }

    // Click to play
    aw.ctx.shadowBlur = 20;
    aw.ctx.shadowColor = "#08F";
    aw.drawText({text:"CLICK TO PLAY", x:screenWidth*0.5, y:screenHeight*0.5, fontSize:20, fontStyle:"bold", color:"#08F", textAlign:"center"});
}