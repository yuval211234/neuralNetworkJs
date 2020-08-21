"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NTuple_1 = require("./NTuple");
class Matrix {
    constructor(numbers) {
        this.calculateFlippedMatrix = () => {
            const newMatrixValues = [];
            for (let col = 0; col < this.width; col++) {
                const newValuesRow = [];
                for (let row = 0; row < this.height; row++) {
                    newValuesRow.push(this.matrixValues[row][col]);
                }
                newMatrixValues.push(newValuesRow);
            }
            return new Matrix(newMatrixValues);
        };
        this.multiplayByNTuple = (nTuple) => {
            if (this.width === nTuple.length) {
                const newNTupleValues = [];
                for (let row = 0; row < this.height; row++) {
                    let newValueInNTuple = 0;
                    for (let col = 0; col < this.width; col++) {
                        const newValue = this.matrixValues[row][col] * nTuple.nTupleValues[col];
                        newValueInNTuple += newValue;
                    }
                    newNTupleValues.push(newValueInNTuple);
                }
                return new NTuple_1.NTuple(newNTupleValues);
            }
            else {
                throw ('the width of the matrix most be equal to the length of the ntuple');
            }
        };
        this.multiplayByNumber = (number) => {
            const newMatrixValues = [];
            for (let row = 0; row < this.height; row++) {
                const newValuesRow = [];
                for (let col = 0; col < this.width; col++) {
                    const newValue = this.matrixValues[row][col] * number;
                    newValuesRow.push(newValue);
                }
                newMatrixValues.push(newValuesRow);
            }
            return new Matrix(newMatrixValues);
        };
        this.addMatrix = (matrix) => {
            if (this.height === matrix.height && this.width === matrix.width) {
                const newMatrixValues = [];
                for (let row = 0; row < this.height; row++) {
                    const newValuesRow = [];
                    for (let col = 0; col < this.width; col++) {
                        const newValue = this.matrixValues[row][col] + matrix.matrixValues[row][col];
                        newValuesRow.push(newValue);
                    }
                    newMatrixValues.push(newValuesRow);
                }
                return new Matrix(newMatrixValues);
            }
            else {
                throw ('the width and height of the matrix most be equal to the width and height of the other matrix');
            }
        };
        this.width = numbers[0].length;
        this.height = numbers.length;
        this.matrixValues = numbers;
    }
}
exports.Matrix = Matrix;
//# sourceMappingURL=Matrix.js.map