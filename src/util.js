function getBest()
{
    let best = localStorage.getItem(`best_${difficultyMode}`);
    return best !== null ? parseInt(best, 10) : 0;
}

function setBest()
{
    localStorage.setItem(`best_${difficultyMode}`, Math.max(levelIdx.toString(), getBest()));
}