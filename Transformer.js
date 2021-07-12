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
    var map = this.initMap(parsedData);
    var populatedMap = this.populateMap(map, parsedData);
    return {
      valid: validData,
      transformedData: populatedMap,
      test: populatedMap,
      parsedData: parsedData,
    };
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

  var hasOneAndOnlyOneCLine =
    parsedData.filter((line, index) => {
      return line[0] === "C";
    }).length === 1;

  var noOutOfBounds = () => {
    if (hasOneAndOnlyOneCLine) {
      var cLine = parsedData.filter((line, index) => {
        return line[0] === "C";
      });
      return (
        parsedData.filter((line, index) => {
          if (["C", "T", "M"].includes(line[0])) {
            return (
              line[1] < 0 &&
              line[1] > cLine[1] &&
              line[2] < 0 &&
              line[2] > cLine[2]
            );
          } else if (line[0] === "A") {
            return (
              line[2] < 0 &&
              line[2] > cLine[1] &&
              line[3] < 0 &&
              line[3] > cLine[2]
            );
          }
          return false;
        }).length === 0
      );
    }
    return false;
  };

  return (
    respectedRules && noOverlap && noOutOfBounds() && hasOneAndOnlyOneCLine
  );
};

Transformer.prototype.initMap = function (parsedData) {
  var cLine = parsedData.filter(function (line) {
    return line[0] === "C";
  })[0];
  var height = Number(cLine[1]);
  var width = Number(cLine[2]);
  var matrix = Array(height)
    .fill(null)
    .map(function (a, i) {
      return Array(width)
        .fill(null)
        .map(function (b, j) {
          return { value: 1, type: "Grass", x: i + 1, y: j + 1 };
        });
    });
  return { matrix, height, width };
};

Transformer.prototype.populateMap = function (map, parsedData) {
  parsedData.forEach((line) => {
    if (line[0] === "T") {
      map.matrix[line[1]][line[2]].type = "Treasure";
      map.matrix[line[1]][line[2]].value = line[3];
    }
    if (line[0] === "M") map.matrix[line[1]][line[2]].type = "Mountain";
    if (line[0] === "A") {
      map.matrix[line[2]][line[3]].type = "Player";
      map.matrix[line[2]][line[3]].name = line[1];
      map.matrix[line[2]][line[3]].orientation = line[4];
      map.matrix[line[2]][line[3]].sequence = line[5];
    }
  });
  return map;
};

module.exports = Transformer;
