function getBest()
{
    let best = window.localStorage.getItem(`best_${difficultyMode}`);
    return best !== null ? parseInt(best, 10) : 0;
}

function setBest()
{
    window.localStorage.setItem(`best_${difficultyMode}`, Math.max(levelIdx.toString(), getBest()));
}

function getDifficultyModeName()
{
    let modeName = "EASY MODE";
    if (difficultyMode === 1)
    {
        modeName = "HARD MODE"
    }
    else if (difficultyMode === 2)
    {
        modeName = "ULTRA MEGA MODE";
    }

    return modeName;
}