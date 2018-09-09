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
            info.x = p + (r - p)*(1.0 - gamma);
            info.y = q + (s - q)*(1.0 - gamma);
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

// From book: Real Time Collision Detection - Christer Ericson
function sqDistanceToLine(ax, ay, bx, by, cx, cy)
{
    let ab = {x:bx - ax, y:by - ay};
    let ac = {x:cx - ax, y:cy - ay};
    let bc = {x:cx - bx, y:cy - by};

    // Handle cases where c projects outside of ab
    let e = dot(ac, ab);
    if (e <= 0.0)
    {
        return dot(ac, ac);
    }

    let f = dot(ab, ab);
    if (e >= f)
    {
        return dot(bc, bc);
    }

    // Handle cases where c projects onto ab
    return dot(ac, ac) - e * e / f;
}

function dot(v1, v2)
{
    return v1.x*v2.x + v1.y*v2.y;
}