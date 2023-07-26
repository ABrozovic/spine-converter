export enum SPINE_VERSION {
  UNKNOWN = 0,
  VER34 = 34,
  VER37 = 37,
  VER38 = 38,
  VER40 = 40,
  VER41 = 41,
}

const versionMap: Record<string, SPINE_VERSION> = {
  "3.3": SPINE_VERSION.VER34,
  "3.4": SPINE_VERSION.VER34,
  "3.7": SPINE_VERSION.VER37,
  "3.8": SPINE_VERSION.VER38,
  "4.0": SPINE_VERSION.VER40,
  "4.1": SPINE_VERSION.VER41,
};

export function detectSpineVersion(version: string): SPINE_VERSION {
  const ver3 = version.substr(0, 3);

  if (versionMap[ver3]) {
    return versionMap[ver3];
  }

  const verNum = Math.floor(Number(ver3) * 10 + 1e-3);

  if (verNum < 37) {
    return SPINE_VERSION.VER37;
  }

  return SPINE_VERSION.UNKNOWN;
}
