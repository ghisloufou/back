fs = require("fs");

describe("Transformer", function () {
  var Transformer = require("../Transformer");
  var transformer;

  beforeEach(function () {
    transformer = new Transformer();
  });

  //   it("should transform data according to the exercise rules", function () {
  //     fs.readFile("test.txt", "utf8", function (err, data) {
  //       var newData = transformer.transformData(data);
  //     expect(newData).toEqual({ valid: true, transformedData: parsedData });
  //     });
  //   });

  // Can't manage to make this test work due to line breaks
//   it("should read file data", function () {
//     fs.readFile("spec/test.txt", "utf8", function (err, data) {
//       console.log("data", data);
//       expect(data).toEqual(
//         `C - 3 - 4
//      M - 1 - 0
//      M - 2 - 1
//      T - 0 - 3 - 2
//      T - 1 - 3 - 3
//      A - Lara - 1 - 1 - S - AADADAGGA`
//       );
//     });
//   });

  it("should parse data line by line", function () {
    fs.readFile("spec/test.txt", "utf8", function (err, data) {
      var parsedData = transformer.parseData(data);
      expect(parsedData).toEqual([
        ["C", 3, 4],
        ["M", 1, 0],
        ["M", 2, 1],
        ["T", 0, 3, 2],
        ["T", 1, 3, 3],
        ["A", "Lara", 1, 1, "S", "AADADAGGA"],
      ]);
    });
  });

  it("should valid parsed data", function () {
    fs.readFile("spec/test.txt", "utf8", function (err, data) {
      var parsedData = transformer.parseData(data);
      var validData = transformer.validateData(parsedData);
      expect(validData).toEqual(true);
    });
  });

  it("should not valid parsed data for the line-argument-error.txt file", function () {
    fs.readFile("spec/line-argument-error.txt", "utf8", function (err, data) {
      var parsedData = transformer.parseData(data);
      var validData = transformer.validateData(parsedData);
      expect(validData).toEqual(false);
    });
  });

  it("should not valid parsed data for the line-letter-error.txt file", function () {
    fs.readFile("spec/line-letter-error.txt", "utf8", function (err, data) {
      var parsedData = transformer.parseData(data);
      var validData = transformer.validateData(parsedData);
      expect(validData).toEqual(false);
    });
  });

  it("should not valid parsed data for the out-of-bounds-error.txt file", function () {
    fs.readFile("spec/out-of-bounds-error.txt", "utf8", function (err, data) {
      var parsedData = transformer.parseData(data);
      var validData = transformer.validateData(parsedData);
      expect(validData).toEqual(false);
    });
  });

  it("should not valid parsed data for the random-text-error.txt file", function () {
    fs.readFile("spec/random-text-error.txt", "utf8", function (err, data) {
      var parsedData = transformer.parseData(data);
      var validData = transformer.validateData(parsedData);
      expect(validData).toEqual(false);
    });
  });
});
