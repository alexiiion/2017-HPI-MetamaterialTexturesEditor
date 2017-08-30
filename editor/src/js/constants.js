function define(name, value) {
  Object.defineProperty(exports, name, {
      value:      value,
      enumerable: true
  });
}

define("SCALE_X", 2.0);
define("SCALE_Y", 1.0);
define("SCALE_Z", 1.0);

define("HINGE_LINE_WIDTH", 2.0);
define("OUTLINE_LINE_WIDTH", 1.0);

define("MAX_FORESHORTENING_PERC", 0.75)
define("MAX_HINGE_DISTANCE_PERC", 0.5)
define("MAX_HINGE_OFFSET_PERC", 0.5)
define("MAX_HINGE_POSITION_PERC", 0.5)
define("MAX_TENSION", 0.5)
