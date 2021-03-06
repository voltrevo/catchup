const plus = (a, b) => a + b;

const assert = x => {
  if (!x) {
    throw new Error('Assertion failed');
  }
};

const adjustDestForCropTolerance = (rect, tol, dest) => {
  const rectAspect = rect.width / rect.height;
  const destAspect = dest.width / dest.height;

  const adjDest = {
    x: dest.x,
    y: dest.y,
    width: dest.width,
    height: dest.height,
  };

  if (rectAspect > destAspect) {
    // input too wide
    if (rectAspect / destAspect > 1 + tol) {
      adjDest.height = (rect.height * dest.width) / rect.width * (1 + tol);
      assert(adjDest.height < dest.height);
      adjDest.y += 0.5 * (dest.height - adjDest.height);
    }
  } else {
    // input too tall
    if (destAspect / rectAspect > 1 + tol) {
      adjDest.width = (rect.width * dest.height) / rect.height * (1 + tol);
      assert(adjDest.width < dest.width);
      adjDest.x += 0.5 * (dest.width - adjDest.width);
    }
  }

  return adjDest;
};

export default (width, height, rects, tol = 0.1) => {
  const overallAspect = (
    rects.map(r => r.width).reduce(plus) /
    rects.map(r => r.height).reduce(plus)
  );

  const targetAspect = width / height;
  const targetRelativeAspect = targetAspect / overallAspect;

  const floatRows = Math.sqrt(rects.length / targetRelativeAspect);
  const floatCols = floatRows * targetRelativeAspect;

  let cols = Math.ceil(floatCols);
  let rows = Math.ceil(floatRows);

  while ((cols - 1) * rows >= rects.length || cols * (rows - 1) >= rects.length) {
    const colErr = Math.abs((cols - 1) / rows - floatCols / floatRows);
    const rowErr = Math.abs(cols / (rows - 1) - floatCols / floatRows);

    if (colErr < rowErr && (cols - 1) * rows >= rects.length) {
      cols--;
    } else {
      rows--;
    }
  }

  assert(rows * cols >= rects.length);
  assert((rows - 1) * cols < rects.length);
  assert(rows * (cols - 1) < rects.length);

  const cellRect = { width: width / cols, height: height / rows };

  return rects.map((rect, index) => {
    const i = Math.floor(index / cols);
    const j = index % cols;

    const res = adjustDestForCropTolerance(rect, tol, {
      x: j * cellRect.width,
      y: i * cellRect.height,
      width: cellRect.width,
      height: cellRect.height,
    });

    res.rect = rect;

    return res;
  });
};
