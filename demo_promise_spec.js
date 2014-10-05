// Unit tests via: npm install jasmine-node

var DemoPromise = require('./demo_promise4_exceptions');

describe('Order of resolving', function () {
    it('resolves first', function (done) {
        var dp = new DemoPromise();
        dp.resolve('abc');
        dp.then(function (value) {
            expect(value).toBe('abc');
            done();
        });
    });
    it('resolves last', function (done) {
        var dp = new DemoPromise();
        dp.then(function (value) {
            expect(value).toBe('abc');
            done();
        });
        dp.resolve('abc');
    });
});

describe('Chaining', function () {
    it('chains with a non-thenable', function (done) {
        var dp = new DemoPromise();
        dp.resolve('a');
        dp
        .then(function (value1) {
            expect(value1).toBe('a');
            return 'b';
        })
        .then(function (value2) {
            expect(value2).toBe('b');
            done();
        });
    });

    it('chains with a promise', function (done) {
        var dp1 = new DemoPromise();
        var dp2 = new DemoPromise();
        dp1.resolve(dp2);
        dp2.resolve(123);
        // Has the value been passed on to dp1?
        dp1.then(function (value) {
            expect(value).toBe(123);
            done();
        });
    });
});

describe('Fulfilling by returning in reactions', function () {
    it('fulfills via onFulfilled', function (done) {
        var dp = new DemoPromise();
        dp.resolve();
        dp
        .then(function (value1) {
            expect(value1).toBe(undefined);
            return 123;
        })
        .then(function (value2) {
            expect(value2).toBe(123);
            done();
        });
    });
    it('fulfills via onRejected', function (done) {
        var dp = new DemoPromise();
        dp.reject();
        dp
        .catch(function (reason) {
            expect(reason).toBe(undefined);
            return 123;
        })
        .then(function (value) {
            expect(value).toBe(123);
            done();
        });
    });
});
describe('Rejecting by throwing in reactions', function () {
    it('rejects via onFulfilled', function (done) {
        var myError;
        var dp = new DemoPromise();
        dp.resolve();
        dp
        .then(function (value) {
            expect(value).toBe(undefined);
            throw myError = new Error();
        })
        .catch(function (reason) {
            expect(reason).toBe(myError);
            done();
        });
    });
    it('rejects via onRejected', function (done) {
        var myError;
        var dp = new DemoPromise();
        dp.reject();
        dp
        .catch(function (reason1) {
            expect(reason1).toBe(undefined);
            throw myError = new Error();
        })
        .catch(function (reason2) {
            expect(reason2).toBe(myError);
            done();
        });
    });
});