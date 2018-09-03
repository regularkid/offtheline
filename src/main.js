var screenWidth = 640;
var screenHeight = 480;
var screenScale = 1.0;

var aw = new Aw(screenWidth, screenHeight, screenScale, []);
aw.state = init;

var level;
var player;
var levelIdx = 2;
let levelClassMap =
{
    L01: L01,
    L02: L02,
    L03: L03,
};

function init()
{
    aw.state = playing;

    initLevel(levelIdx);

    aw.ctx.translate(screenWidth*0.5, screenHeight*0.5);
    aw.ctx.scale(1.0, -1.0);
    aw.ctx.shadowBlur = 10;
    aw.ctx.shadowColor = "#08F";
}

function playing()
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
}

function initLevel(idx)
{
    aw.clearAllEntities();

    idx += 1;
    let levelClassName = `L${idx < 10 ? "0" + idx : idx}`;
    level = new levelClassMap[levelClassName]();
    player = new Player();

    aw.addEntity(level);
    aw.addEntity(player);
}