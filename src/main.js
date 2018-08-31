var screenWidth = 320;
var screenHeight = 240;
var screenScale = 2.0;

var aw = new Aw(screenWidth, screenHeight, screenScale, []);

aw.state = init;
function init()
{
    aw.state = playing;
    console.log("Started!");
}

function playing()
{
}