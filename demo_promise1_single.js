// Features:
// * then() must work independently if the promise is
//   settled either before or after it is called
// * You can only resolve or reject once

export class DemoPromise {
    constructor() {
        this.fulfillReactions = [];
        this.rejectReactions = [];
        this.promiseResult = undefined;
        this.promiseState = 'pending';
    }
    then(onFulfilled, onRejected) {
        let self = this;
        let fulfilledTask = function () {
            onFulfilled(self.promiseResult);
        };
        let rejectedTask = function () {
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
