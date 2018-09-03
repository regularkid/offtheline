function getLineIntersectionInfo(a, b, c, d, p, q, r, s)
{
    let det, gamma, lambda;
    let info = {intersect:false};
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det !== 0)
    {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        if ((0 < lambda && lambda < 1) && (0 < gamma && gamma < 1))
        {
            info.x = p + (r - p)*gamma;
            info.y = q + (s - q)*gamma;
            info.time = gamma;
            info.intersect = true;
        }
    }

    return info;
}

function closestPointToLine(px, py, x1, y1, x2, y2)
{
    let nx = x2 - x1;
    let ny = y2 - y1;
    let length = Math.sqrt((nx*nx) + (ny*ny));
    nx /= length;
    ny /= length;

    let toPx = px - x1;
    let toPy = py - y1;
    let length2 = Math.sqrt((toPx*toPx) + (toPy*toPy));
    toPx /= length2;
    toPy /= length2;

    let dot = (toPx*nx) + (toPy*ny);
    let cx = x1 + nx*dot*length;
    let cy = y1 + ny*dot*length;

    return {x:cx, y:cy};
}

function distanceToLine(px, py, x1, y1, x2, y2)
{
    let c = closestPointToLine(px, py, x1, y1, x2, y2);

    let dx = px - c.x;
    let dy = py - c.y;
    return Math.sqrt((dx*dx) + (dy*dy));
}