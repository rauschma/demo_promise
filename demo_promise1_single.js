// Features:
// * then() must work independently if the promise is
//   settled either before or after it is called
// * You can only resolve or reject once

function DemoPromise() {
    this.fulfillReactions = [];
    this.rejectReactions = [];
    this.promiseResult = undefined;
    this.promiseState = 'pending';
}
DemoPromise.prototype.then = function (onFulfilled, onRejected) {
    var self = this;
    var fulfilledTask = function () {
        onFulfilled(self.promiseResult);
    };
    var rejectedTask = function () {
        onRejected(self.promiseResult);
    };
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
