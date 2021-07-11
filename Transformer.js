function Transformer() {}

Transformer.lineRules = [
  {
    letter: "C",
    arguments: 2,
  },
  {
    letter: "M",
    arguments: 2,
  },
  {
    letter: "T",
    arguments: 3,
  },
  {
    letter: "A",
    arguments: 5,
  },
];

/* Transform data<String> to apply adventurer's path */
Transformer.prototype.transformData = function (data) {
  var parsedData = this.parseData(data);
  var validData = this.validateData(parsedData);
  if (validData) {
    var map = this.createMap(parsedData);
    return { valid: validData, transformedData: map };
  }
  return { valid: validData, transformedData: null };
};

/* parse data<String> into lines[args[]] */
Transformer.prototype.parseData = function (data) {
  var lines = data.split("\n");
  return lines.map(function (line) {
    var args = line.replace(/\s/g, "").split("-");
    return args;
  });
};

/* Validate data according to lineRules */
Transformer.prototype.validateData = function (parsedData) {
  var respectedRules = parsedData.every((line) => {
    return (
      Transformer.lineRules.find((rule) => {
        return rule.letter === line[0] && rule.arguments === line.length - 1;
      }) !== undefined
    );
  });
  var noOverlap =
    parsedData.filter((line, index) => {
      return (
        parsedData.slice(index + 1).filter((line2) => {
          return line[1] === line2[1] && line[2] === line2[2];
        }).length > 0
      );
    }).length === 0;
  var noOutOfBounds = true; // TODO: Add noOutOfBounds logic
  var hasCLine = true; // TODO: Add hasCLine logic (whether the file contains a C - X - Y line)
  var hasUniqueCLine = true; // TODO: Add hasUniqueCLine logic (whether the file contains a unique C line)
  return (
    respectedRules && noOverlap && noOutOfBounds && hasCLine && hasUniqueCLine
  );
};

Transformer.prototype.createMap = function (validData) {
  var C = validData.filter(function (line) {
    return line[0] === "C";
  })[0];
  var height = Number(C[1]);
  var width = Number(C[2]);
  var matrix = Array(height)
    .fill(null)
    .map(function (a, i) {
      return Array(width)
        .fill(null)
        .map(function (b, j) {
          return { value: 1, type: "Grass", x: i + 1, y: j + 1 };
        });
    });
  return { matrix: matrix, height: height, width: width };
};

module.exports = Transformer;
