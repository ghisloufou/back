var cloneDeep = require("lodash").cloneDeep;
function Transformer() {}

Transformer.lineRules = [
  {
    letter: "C",
    arguments: 2,
    argumentsType: ["number", "number"],
  },
  {
    letter: "M",
    arguments: 2,
    argumentsType: ["number", "number"],
  },
  {
    letter: "T",
    arguments: 3,
    argumentsType: ["number", "number", "number"],
  },
  {
    letter: "A",
    arguments: 5,
    argumentsType: ["string", "number", "number", "string", "string"],
  },
];

/**
 * Transform input file data to apply player's path,
 * returns the validity of input file,
 * the map generated from the input
 * and the map transformed using the input data.
 * @param {string} data Input file content
 * @returns {{valid:boolean, map:"TreasureMap", transformedMap:"TreasureMap"}} { valid, map, transformedMap }
 */
Transformer.prototype.transformData = function (data) {
  var parsedData = this.parseData(data);
  var validData = this.validateData(parsedData);
  if (validData) {
    var map = this.initMap(parsedData);
    var populatedMap = this.populateMap(map, parsedData);
    const result = this.movePlayers(map, parsedData);
    const newData = this.generateNeWFile(result.transformedMap);

    validData = !result.movementError;
    return {
      valid: validData,
      map: populatedMap,
      transformedMap: result.transformedMap,
      newData,
    };
  }
  return { valid: validData, map: null, transformedMap: null };
};

/**
 * Parse file input data into an array of lines of arguments
 * @param {string} data Input file content
 * @returns {any[]} Parsed data as an array of lines
 */
Transformer.prototype.parseData = function (data) {
  var lines = data.split("\n");
  return lines
    .map((line) => {
      var args = line.replace(/\s/g, "").split("-");
      return args.map((arg) => {
        // Check whether the arg is a digit to assign the proper type
        if (/^[0-9]*$/.test(arg)) arg = Number(arg);
        return arg;
      });
    }) // Ignore comment lines starting by #
    .filter((line) => line[0][0] !== "#");
};

/**
 * Generate new file from transformed map
 * @param {"TreasureMap"} map Input file content
 * @returns {string} String to put in new file
 */
Transformer.prototype.generateNeWFile = function (map) {
  let result = "";
  result += `C - ${map.width} - ${map.height}\r\n`;
  map.matrix.forEach((row) => {
    row.forEach((cell) => {
      switch (cell.type) {
        case "Player":
          result += `# {A comme Aventurier} - {Nom de l’aventurier} - {Axe horizontal} - {Axe vertical} - {Orientation} - {Nb. trésors ramassés} - {Etape de l'aventurier}\r\n`;
          result += `A - ${cell.name} - ${cell.x - 1} - ${cell.y - 1} - ${
            cell.orientation
          } - ${cell.playerValue} - ${cell.stepCount}\r\n`;
          break;
        case "WasPlayer":
          result += `# {P comme Passage d'un Aventurier} - {Nom de l’aventurier passé} - {Axe horizontal} - {Axe vertical} - {Etape à laquelle il est passé}\r\n`;
          result += `P - ${cell.lastPlayerName} - ${cell.x - 1} - ${
            cell.y - 1
          } - ${cell.stepCount}\r\n`;
          break;
        case "Treasure&Player":
          result += `# {TA comme Trésor et Aventurier} - {Nom de l'aventurier} - {Axe horizontal} - {Axe vertical} - {Nb. de trésors restants} - {Orientation} - {Nb. trésors ramassés} - {Etape de l'aventurier}\r\n`;
          result += `TA - ${cell.name} - ${cell.x - 1} - ${cell.y - 1} - ${
            cell.treasureCount
          } - ${cell.orientation} - ${cell.playerValue} - ${
            cell.stepCount
          }\r\n`;
          break;
        case "Treasure":
          result += `# {T comme Trésor} - {Axe horizontal} - {Axe vertical} - {Nb. de trésors restants} - {Etape à laquelle il a été ramassé dernièrement}\r\n`;
          result += `T - ${cell.x - 1} - ${cell.y - 1} - ${
            cell.treasureCount
          } - ${cell.stepCount}\r\n`;
          break;
        case "Mountain":
          result += `# {M comme Trésor} - {Axe horizontal} - {Axe vertical}\r\n`;
          result += `M - ${cell.x - 1} - ${cell.y - 1}\r\n`;
          break;
        default:
          break;
      }
    });
  });
  return result;
};

/**
 * Validate data according to lineRules
 * @param {any[]} parsedData Parsed data from input file
 * @returns {boolean} Boolean if data is conform to lineRules and other checks
 */
Transformer.prototype.validateData = function (parsedData) {
  var respectedRules = parsedData.every((line) => {
    var relatedRule = Transformer.lineRules.find((rule) => {
      return rule.letter === line[0] && rule.arguments === line.length - 1;
    });
    if (relatedRule !== undefined) {
      return relatedRule.argumentsType.every((type, index) => {
        return typeof line[index + 1] === type;
      });
    } else {
      return false;
    }
  });

  var noOverlap =
    parsedData.filter((line, index) => {
      return (
        parsedData.slice(index + 1).filter((line2) => {
          return line[1] === line2[1] && line[2] === line2[2];
        }).length > 0
      );
    }).length === 0;

  var hasOneAndOnlyOneValidCLine =
    parsedData.filter((line, index) => {
      return line[0] === "C" && line[1] >= 0 && line[2] >= 0;
    }).length === 1;

  var noOutOfBounds = () => {
    if (hasOneAndOnlyOneValidCLine) {
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
    respectedRules && noOverlap && noOutOfBounds() && hasOneAndOnlyOneValidCLine
  );
};

/**
 * Creates an grass map with parsed data from input file
 * @param {any[]} parsedData Parsed data from input file
 * @returns {"TreasureMap"} Basic map with only grass cells
 */
Transformer.prototype.initMap = function (parsedData) {
  var cLine = parsedData.filter(function (line) {
    return line[0] === "C";
  })[0];
  var width = Number(cLine[1]);
  var height = Number(cLine[2]);
  var matrix = Array(height)
    .fill(null)
    .map(function (a, i) {
      return Array(width)
        .fill(null)
        .map(function (b, j) {
          return { type: "Grass", x: j + 1, y: i + 1 };
        });
    });
  return { matrix, height, width };
};

/**
 * Fills map cells with data from input file
 * @param {"TreasureMap"} map Generated map from input file
 * @param {any[]} parsedData Parsed data from input file
 * @returns Map with cells filled with data from input file
 */
Transformer.prototype.populateMap = function (map, parsedData) {
  parsedData.forEach((line) => {
    if (line[0] === "T") {
      let cell = map.matrix[line[2]][line[1]];
      cell.type = "Treasure";
      cell.treasureCount = line[3];
    }
    if (line[0] === "M") map.matrix[line[2]][line[1]].type = "Mountain";
    if (line[0] === "A") {
      let cell = map.matrix[line[3]][line[2]];
      cell.type = "Player";
      cell.name = line[1];
      cell.playerValue = 0;
      let orientation = 0;
      switch (line[4]) {
        case "S":
          orientation = 0;
          break;
        case "E":
          orientation = -90;
          break;
        case "O":
          orientation = 90;
          break;
        case "N":
          orientation = 180;
          break;
        default:
          break;
      }
      cell.orientation = orientation;
      cell.sequence = line[5];
    }
  });
  return map;
};

/**
 * Move all the players and returns the new map, parsedData and possible movementErrors
 * @param {"TreasureMap"} map Generated map from input file
 * @param {any[]} parsedData Parsed data from input file
 * @returns {{ transformedMap: "TreasureMap", newParsedData: any[], movementError: boolean }} {transformedMap, newParsedData, movementError}
 */
Transformer.prototype.movePlayers = function (map, parsedData) {
  var newParsedData = cloneDeep(parsedData);
  var cLine = newParsedData.filter((line) => line[0] === "C")[0];
  var players = newParsedData.filter((line) => line[0] === "A");
  var newMap = cloneDeep(map);
  var movementError = false; // Check wheter the player sequence is feasible

  const updateMap = function (player, nextMovement, index) {
    const nextCell =
      newMap.matrix[nextMovement.player[3]][nextMovement.player[2]];
    const lastCell = newMap.matrix[player[3]][player[2]];
    if (nextMovement.didMove) {
      // Edit new cell
      if (nextCell.type === "Treasure" && nextCell.treasureCount > 1) {
        nextCell.type = "Treasure&Player";
        nextCell.playerValue = lastCell.playerValue + 1;
        nextCell.treasureCount -= 1;
      } else {
        nextCell.playerValue = lastCell.playerValue;
        if (nextCell.type === "Treasure" && nextCell.treasureCount === 1) {
          delete nextCell.treasureCount;
          nextCell.playerValue += + 1;
        }
        nextCell.type = "Player";
      }
      nextCell.name = lastCell.name;
      nextCell.sequence = lastCell.sequence;

      switch (player[4]) {
        case "S":
          nextCell.orientation = 0;
          break;
        case "E":
          nextCell.orientation = -90;
          break;
        case "O":
          nextCell.orientation = 90;
          break;
        case "N":
          nextCell.orientation = 180;
          break;
      }

      // Edit last cell
      if (lastCell.type === "Treasure&Player" && lastCell.treasureCount > 0) {
        lastCell.type = "Treasure";
      } else {
        lastCell.type = "WasPlayer";
        lastCell.lastPlayerName = nextCell.name;
        delete lastCell.treasureCount;
      }
      delete lastCell.name;
      delete lastCell.orientation;
      delete lastCell.sequence;
      delete lastCell.playerValue;
    }
    lastCell.stepCount = index;
    nextCell.stepCount = index + 1;
  };

  var moving = true;
  var i = 0;
  var stopCount = 0;
  while (moving) {
    for (let player of players) {
      if (player[5].length > i) {
        const nextMove = player[5][i];
        if (["A", "G", "D"].includes(nextMove)) {
          const movement = this.move(player, nextMove, cLine, newMap);
          updateMap(player, movement, i);
          players[players.indexOf(player)] = cloneDeep(movement.player);
        } else {
          movementError = true;
          moving = false;
        }
      } else {
        stopCount++;
      }
    }
    if (stopCount === players.length) {
      moving = false;
    }
    i++;
  }
  return { transformedMap: newMap, newParsedData, movementError };
};

/**
 * Returns player new coordinates (if move was possible), boolean if next cell is a treasure and boolean if player did move
 * @param {["A", string, number, number, string, string]} player Player line from input file
 * @param {string} nextMove Next move in the sequence ("A", "G" or "D")
 * @param {["C", number, number]} cLine Map line from input file
 * @param {"TreasureMap"} newMap Modified map with data and last player movements
 * @returns {{player: "Player", isTreasure: boolean, didMove: boolean}} {player, isTreasure, didMove}
 */
Transformer.prototype.move = function (playerArg, nextMove, cLine, newMap) {
  const movedPlayer = cloneDeep(playerArg);

  const isNextMoveValid = function (x, y, moveX, moveY) {
    var isNotOutOfBound =
      x + moveX < cLine[1] &&
      x + moveX >= 0 &&
      y + moveY < cLine[2] &&
      y + moveY >= 0;
    if (isNotOutOfBound) {
      const nextCell = newMap.matrix[y + moveY][x + moveX];
      var isMountain = nextCell.type === "Mountain";
      var isPlayer =
        nextCell.type === "Player" || nextCell.type === "Treasure&Player";
      return !isMountain && !isPlayer;
    }
    return false;
  };

  const nextMoveTreasure = function (x, y, moveX, moveY) {
    return newMap.matrix[y + moveY][x + moveX].type === "Treasure";
  };

  const movePlayer = function (player, moveX, moveY) {
    let didMove = false;
    const isTreasure = nextMoveTreasure(player[2], player[3], moveX, moveY);
    if (isNextMoveValid(player[2], player[3], moveX, moveY)) {
      player[2] += moveX;
      player[3] += moveY;
      didMove = true;
    }
    return {
      player,
      isTreasure,
      didMove,
    };
  };

  let movement = { player: movedPlayer, isTreasure: false, didMove: false };

  switch (nextMove) {
    case "A":
      // Check whether the next case is not out of bounds, nor a mountain, nor a player then IGNORE THESE MOVES
      switch (movedPlayer[4]) {
        case "N":
          movement = movePlayer(movedPlayer, 0, -1);
          break;
        case "O":
          movement = movePlayer(movedPlayer, -1, 0);
          break;
        case "S":
          movement = movePlayer(movedPlayer, 0, 1);
          break;
        case "E":
          movement = movePlayer(movedPlayer, 1, 0);
          break;
      }
      break;
    case "G":
      // Change orientation to the left
      switch (movedPlayer[4]) {
        case "N":
          movedPlayer[4] = "O";
          break;
        case "O":
          movedPlayer[4] = "S";
          break;
        case "S":
          movedPlayer[4] = "E";
          break;
        case "E":
          movedPlayer[4] = "N";
          break;
      }
      break;
    case "D":
      // Change orientation to the right
      switch (movedPlayer[4]) {
        case "N":
          movedPlayer[4] = "E";
          break;
        case "E":
          movedPlayer[4] = "S";
          break;
        case "S":
          movedPlayer[4] = "O";
          break;
        case "O":
          movedPlayer[4] = "N";
          break;
      }
      break;
  }

  return movement;
};

module.exports = Transformer;
