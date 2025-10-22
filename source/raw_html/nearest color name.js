function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
	hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  return [
	(bigint >> 16) & 255,
	(bigint >> 8) & 255,
	bigint & 255
  ];
}

function rgbToXyz([r, g, b]) {
  r /= 255; g /= 255; b /= 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100; g *= 100; b *= 100;
  return [
    r * 0.4124 + g * 0.3576 + b * 0.1805,
    r * 0.2126 + g * 0.7152 + b * 0.0722,
    r * 0.0193 + g * 0.1192 + b * 0.9505
  ];
}

function xyzToLab([x, y, z]) {
  const refX = 95.047, refY = 100.0, refZ = 108.883;
  x /= refX; y /= refY; z /= refZ;

  const f = t => (t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116));

  const fx = f(x), fy = f(y), fz = f(z);

  return [
    (116 * fy) - 16,   // L*
    500 * (fx - fy),   // a*
    200 * (fy - fz)    // b*
  ];
}

function rgbToLab(rgb) {
  return xyzToLab(rgbToXyz(rgb));
}

// --- CIEDE2000 ΔE formula ---

function deltaE2000(lab1, lab2) {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  const avgLp = (L1 + L2) / 2.0;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (C1 + C2) / 2.0;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25.0, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);
  const avgCp = (C1p + C2p) / 2.0;

  const h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
  const h2p = Math.atan2(b2, a2p) * 180 / Math.PI;
  const h1pPos = h1p >= 0 ? h1p : h1p + 360;
  const h2pPos = h2p >= 0 ? h2p : h2p + 360;

  let deltahp;
  if (Math.abs(h1pPos - h2pPos) <= 180) {
    deltahp = h2pPos - h1pPos;
  } else {
    deltahp = (h2pPos <= h1pPos) ? h2pPos - h1pPos + 360 : h2pPos - h1pPos - 360;
  }

  const deltaLp = L2 - L1;
  const deltaCp = C2p - C1p;
  const deltaHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((deltahp * Math.PI / 180) / 2);

  const avgHp = (() => {
    if (Math.abs(h1pPos - h2pPos) > 180) {
      return (h1pPos + h2pPos + 360) / 2;
    }
    return (h1pPos + h2pPos) / 2;
  })();

  const T = 1 - 0.17 * Math.cos((avgHp - 30) * Math.PI / 180)
              + 0.24 * Math.cos((2 * avgHp) * Math.PI / 180)
              + 0.32 * Math.cos((3 * avgHp + 6) * Math.PI / 180)
              - 0.20 * Math.cos((4 * avgHp - 63) * Math.PI / 180);

  const deltaRo = 30 * Math.exp(-((avgHp - 275) / 25) * ((avgHp - 275) / 25));
  const Rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25.0, 7)));
  const Sl = 1 + ((0.015 * ((avgLp - 50) * (avgLp - 50))) / Math.sqrt(20 + ((avgLp - 50) * (avgLp - 50))));
  const Sc = 1 + 0.045 * avgCp;
  const Sh = 1 + 0.015 * avgCp * T;
  const Rt = -Math.sin(2 * deltaRo * Math.PI / 180) * Rc;

  const dE = Math.sqrt(
    (deltaLp / Sl) * (deltaLp / Sl) +
    (deltaCp / Sc) * (deltaCp / Sc) +
    (deltaHp / Sh) * (deltaHp / Sh) +
    Rt * (deltaCp / Sc) * (deltaHp / Sh)
  );

  return dE;
}

function colorDistance(rgb1, rgb2) {
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  return deltaE2000(lab1, lab2);
}

//    function colorDistance(rgb1, rgb2) {
//      return (rgb1[0] - rgb2[0]) ** 2 +
//             (rgb1[1] - rgb2[1]) ** 2 +
//             (rgb1[2] - rgb2[2]) ** 2;
//    }

  function findNearestColor(hexColor) {
    const inputRgb = hexToRgb(hexColor);
    let nearest = null;
    let nearestDist = Infinity;

    for (const color of window.colorData) {
      const dist = colorDistance(inputRgb, color.rgb);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = color.name;
      }
    }
    return nearest;
  }
  
  window.findNearestColor = findNearestColor;