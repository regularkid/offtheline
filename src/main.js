var screenWidth = 640;
var screenHeight = 480;
var screenScale = 1.0;

var aw = new Aw(screenWidth, screenHeight, screenScale, []);
aw.state = init;

var level;
var player;
var levelIdx = 6;
var endLevelTime = 0;
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

    if (player.isDead || level.isComplete())
    {
        endLevelTime -= deltaTime;
        if (endLevelTime <= 0.0)
        {
            if (player.isDead)
            {
                initLevel(levelIdx);
            }
            else
            {
                levelIdx = (levelIdx + 1) % Object.keys(levelClassMap).length;
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