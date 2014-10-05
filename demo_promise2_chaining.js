// Features:
// * then() returns a promise, which fulfills with what
//   either onFulfilled or onRejected return
// * Missing onFulfilled and onRejected pass on what they receive

function DemoPromise() {
    this.fulfillReactions = [];
    this.rejectReactions = [];
    this.promiseResult = undefined;
    this.promiseState = 'pending';
}
DemoPromise.prototype.then = function (onFulfilled, onRejected) {
    var returnValue = new Promise(); // [new]
    var self = this;

    var fulfilledTask;
    if (typeof onFulfilled === 'function') {
        fulfilledTask = function () {
            var r = onFulfilled(self.promiseResult);
            returnValue.resolve(r); // [new]
        };
    } else { // [new]
        fulfilledTask = function () {
            returnValue.resolve(self.promiseResult);
        };
    }

    var rejectedTask;
    if (typeof onRejected === 'function') {
        rejectedTask = function () {
            var r = onRejected(self.promiseResult);
            returnValue.resolve(r); // [new]
        };
    } else { // [new]
        rejectedTask = function () {
            // Important: we must reject here!
            // Normally, the result of `onRejected` is used to resolve.
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
};
DemoPromise.prototype.resolve = function (value) {
    if (this.promiseState !== 'pending') return;
    this.promiseState = 'fulfilled';
    this.promiseResult = value;
    this._clearAndEnqueueReactions(this.fulfillReactions);
    return this; // enable chaining
};
DemoPromise.prototype.reject = function (error) {
    if (this.promiseState !== 'pending') return;
    this.promiseState = 'rejected';
    this.promiseResult = error;
    this._clearAndEnqueueReactions(this.rejectReactions);
    return this; // enable chaining
};
DemoPromise.prototype._clearAndEnqueueReactions = function (reactions) {
    this.fulfillReactions = undefined;
    this.rejectReactions = undefined;
    reactions.map(addToTaskQueue);
};
function addToTaskQueue(task) {
    setTimeout(task, 0);
}
