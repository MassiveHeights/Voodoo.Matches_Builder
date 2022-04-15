function INTERSECT(p1, p2, p3, p4) {
  const {x: x1, y: y1} = p1;
  const {x: x2, y: y2} = p2;
  const {x: x3, y: y3} = p3;
  const {x: x4, y: y4} = p4;

  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }

  const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

  // if (denominator === 0) {
  //   return false;
  // }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false;
  }

  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);

  return {x, y};
}

export default INTERSECT;