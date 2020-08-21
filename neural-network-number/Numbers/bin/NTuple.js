"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Matrix_1 = require("./Matrix");
class NTuple {
    constructor(numbers) {
        this.addNTuple = (nTuple) => {
            if (nTuple.length === this.length) {
                const newNTupleValues = this.nTupleValues.map((number, index) => {
                    return number + nTuple.nTupleValues[index];
                });
                return new NTuple(newNTupleValues);
            }
            else {
                throw ('the tuples most be the same length');
            }
        };
        this.turnIntoMatrix = (matrixWidth) => {
            const matrixValues = this.nTupleValues.map(number => {
                const row = [];
                if (matrixWidth) {
                    for (let col = 0; col < matrixWidth; col++) {
                        row.push(number);
                    }
                }
                else {
                    row.push(number);
                }
                return row;
            });
            return new Matrix_1.Matrix(matrixValues);
        };
        this.getDiffernceNTuple = (nTuple) => {
            if (this.length === nTuple.length) {
                const differenceTuple = this.nTupleValues.map((number, index) => {
                    return Math.pow(number - nTuple.nTupleValues[index], 2);
                });
                return new NTuple(differenceTuple);
            }
            else {
                throw ('ntuple must have the same length');
            }
        };
        this.multiplayByNTuple = (nTuple) => {
            if (this.length === nTuple.length) {
                const newNTupleValues = this.nTupleValues.map((numberToMultiplay, location) => numberToMultiplay * nTuple.nTupleValues[location]);
                return new NTuple(newNTupleValues);
            }
            else {
                throw ('ntuple must have the same length');
            }
        };
        this.multiplayByNTupleToMatrix = (nTuple) => {
            const newMatrixValues = [];
            for (let row = 0; row < this.length; row++) {
                const newRow = [];
                for (let col = 0; col < nTuple.length; col++) {
                    newRow.push(this.nTupleValues[row] * nTuple.nTupleValues[col]);
                }
                newMatrixValues.push(newRow);
            }
            return new Matrix_1.Matrix(newMatrixValues);
        };
        this.multiplayByNumber = (number) => {
            const newNTupleValues = this.nTupleValues.map(numberToMultiplay => numberToMultiplay * number);
            return new NTuple(newNTupleValues);
        };
        this.applyFunction = (functionToApply) => {
            const newNTupleValues = this.nTupleValues.map(number => functionToApply(number));
            return new NTuple(newNTupleValues);
        };
        this.getMaxNumberIndex = () => {
            const tuple = new NTuple([...this.nTupleValues]);
            const maxNumber = tuple.nTupleValues.sort((prev, current) => current - prev)[0];
            return this.nTupleValues.findIndex(number => number === maxNumber);
        };
        this.length = numbers.length;
        this.nTupleValues = numbers;
    }
}
exports.NTuple = NTuple;
//# sourceMappingURL=NTuple.js.map