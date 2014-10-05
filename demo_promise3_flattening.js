// Features:
// * resolve() “flattens” parameter `value` if it is a promise
//   (the state of`this` becomes locked in on `value`)

function DemoPromise() {
    this.fulfillReactions = [];
    this.rejectReactions = [];
    this.promiseResult = undefined;
    this.promiseState = 'pending';
    // Settled or locked-in?
    this.alreadyResolved = false;
}
DemoPromise.prototype.then = function (onFulfilled, onRejected) {
    var returnValue = new DemoPromise();
    var self = this;

    var fulfilledTask;
    if (typeof onFulfilled === 'function') {
        fulfilledTask = function () {
            var r = onFulfilled(self.promiseResult);
            returnValue.resolve(r);
        };
    } else {
        fulfilledTask = function () {
            returnValue.resolve(self.promiseResult);
        };
    }

    var rejectedTask;
    if (typeof onRejected === 'function') {
        rejectedTask = function () {
            var r = onRejected(self.promiseResult);
            returnValue.resolve(r);
        };
    } else {
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
DemoPromise.prototype.resolve = function (value) { // [new]
    if (this.alreadyResolved) return;
    this.alreadyResolved = true;
    this._doResolve(value);
    return this; // enable chaining
};
DemoPromise.prototype._doResolve = function (value) { // [new]
    var self = this;
    // Is `value` a thenable?
    if (value !== null && typeof value === 'object' && 'then' in value) {
        // Forward fulfillments and rejections from `value` to `this`.
        // Added as a task (vs. done immediately) to preserve async semantics.
        addToTaskQueue(function () {
            value.then(
                function onFulfilled(result) {
                    self._doResolve(result);
                },
                function onRejected(error) {
                    self._doReject(error);
                });
        });
    } else {
        this.promiseState = 'fulfilled';
        this.promiseResult = value;
        this._clearAndEnqueueReactions(this.fulfillReactions);
    }
};

DemoPromise.prototype.reject = function (error) { // [new]
    if (this.alreadyResolved) return;
    this.alreadyResolved = true;
    this._doReject(error);
    return this; // enable chaining
};
DemoPromise.prototype._doReject = function (error) { // [new]
    this.promiseState = 'rejected';
    this.promiseResult = error;
    this._clearAndEnqueueReactions(this.rejectReactions);
};

DemoPromise.prototype._clearAndEnqueueReactions = function (reactions) {
    this.fulfillReactions = undefined;
    this.rejectReactions = undefined;
    reactions.map(addToTaskQueue);
};
function addToTaskQueue(task) {
    setTimeout(task, 0);
}
