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