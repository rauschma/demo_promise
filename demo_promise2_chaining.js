// Features:
// * then() returns a promise, which fulfills with what
//   either onFulfilled or onRejected return
// * Missing onFulfilled and onRejected pass on what they receive

export class DemoPromise {
    constructor() {
        this.fulfillReactions = [];
        this.rejectReactions = [];
        this.promiseResult = undefined;
        this.promiseState = 'pending';
    }
    then(onFulfilled, onRejected) {
        let returnValue = new Promise(); // [new]
        let self = this;

        let fulfilledTask;
        if (typeof onFulfilled === 'function') {
            fulfilledTask = function () {
                let r = onFulfilled(self.promiseResult);
                returnValue.resolve(r); // [new]
            };
        } else { // [new]
            fulfilledTask = function () {
                returnValue.resolve(self.promiseResult);
            };
        }

        let rejectedTask;
        if (typeof onRejected === 'function') {
            rejectedTask = function () {
                let r = onRejected(self.promiseResult);
                returnValue.resolve(r); // [new]
            };
        } else { // [new]
            rejectedTask = function () {
                // `onRejected` has not been provided
                // => we must pass on the rejection
                returnValue.reject(self.promiseResult);
            };
        }

        switch (this.promiseState) {
            case 'pending':
                this.fulfillReactions.push(fulfilledTask);
                this.rejectReactions.push(rejectedTask);
                break;
            case 'fulfilled':
                addToTaskQueue(fulfilledTask);
                break;
            case 'rejected':
                addToTaskQueue(rejectedTask);
                break;
        }
        return returnValue;
    }
    resolve(value) {
        if (this.promiseState !== 'pending') return;
        this.promiseState = 'fulfilled';
        this.promiseResult = value;
        this._clearAndEnqueueReactions(this.fulfillReactions);
        return this; // enable chaining
    }
    reject(error) {
        if (this.promiseState !== 'pending') return;
        this.promiseState = 'rejected';
        this.promiseResult = error;
        this._clearAndEnqueueReactions(this.rejectReactions);
        return this; // enable chaining
    }
    _clearAndEnqueueReactions(reactions) {
        this.fulfillReactions = undefined;
        this.rejectReactions = undefined;
        reactions.map(addToTaskQueue);
    }
}
function addToTaskQueue(task) {
    setTimeout(task, 0);
}
