'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const _1 = require("../../");
const stream_1 = require("stream");
const through2 = require("through2");
const get_stream_1 = require("get-stream");
describe('default', () => {
    it('should get null on already ended stream', async () => {
        const stream = through2();
        stream.end();
        const data = await _1.default(stream);
        chai_1.expect(data).to.be.null;
    });
    it('should get only chunk on stream ended with data', async () => {
        const stream = through2();
        stream.end('data');
        const data1 = await _1.default(stream);
        const data2 = await _1.default(stream);
        chai_1.expect(data1.toString()).to.equal('data');
        chai_1.expect(data2).to.be.null;
    });
    it('should get two chunks', async () => {
        const stream = through2();
        stream.write('foo');
        const data1 = await _1.default(stream);
        stream.write('bar');
        const data2 = await _1.default(stream);
        stream.end();
        const data3 = await _1.default(stream);
        chai_1.expect(data1.toString()).to.equal('foo');
        chai_1.expect(data2.toString()).to.equal('bar');
        chai_1.expect(data3).to.be.null;
    });
    it('should get two async chunks', async () => {
        const stream = through2();
        setTimeout(() => stream.write('foo'), 5);
        const data1 = await _1.default(stream);
        setTimeout(() => stream.write('bar'), 5);
        const data2 = await _1.default(stream);
        setTimeout(() => stream.end(), 50);
        const data3 = await _1.default(stream);
        chai_1.expect(data1.toString()).to.equal('foo');
        chai_1.expect(data2.toString()).to.equal('bar');
        chai_1.expect(data3).to.be.null;
    });
    it('should handle destroyed stream', async () => {
        const stream = through2();
        stream.write('foo');
        const data1 = await _1.default(stream);
        stream.destroy();
        const data2 = await _1.default(stream);
        chai_1.expect(data1.toString()).to.equal('foo');
        chai_1.expect(data2).to.be.null;
    });
    it('should handle error in reading', async () => {
        const stream = new stream_1.Readable();
        const testError = new Error("Test error");
        const datas = ['foo'];
        stream._read = function () {
            if (datas.length === 0) {
                setImmediate(() => this.emit('error', testError));
                return;
            }
            this.push(datas.shift());
        };
        const data1 = await _1.default(stream);
        try {
            await _1.default(stream);
            chai_1.expect(false).to.be.true;
        }
        catch (err) {
            chai_1.expect(data1.toString()).to.equal('foo');
            chai_1.expect(err).to.equal(testError);
        }
    });
    it('should handle error event', async () => {
        const stream = through2();
        stream.write('foo');
        const data1 = await _1.default(stream);
        const asyncData2 = _1.default(stream);
        stream.emit('error', new Error("bar"));
        try {
            await asyncData2;
            chai_1.expect(false).to.be.true;
        }
        catch (err) {
            chai_1.expect(data1.toString()).to.equal('foo');
            chai_1.expect(err.message).to.equal('bar');
        }
    });
    it('should reject falsy stream', async () => {
        try {
            await _1.default(null);
            chai_1.expect(false).to.be.true;
        }
        catch (err) {
            chai_1.expect(err.message).to.contain('Not a');
        }
    });
    it('should be possible to pipe stream after a chunk', async () => {
        const stream = through2();
        setTimeout(() => stream.write('foo'), 5);
        const data1 = await _1.default(stream);
        setTimeout(() => stream.end('bar'), 5);
        const stream2 = through2();
        stream.pipe(stream2);
        const data2 = await get_stream_1.buffer(stream2);
        chai_1.expect(data1.toString()).to.equal('foo');
        chai_1.expect(data2.toString()).to.equal('bar');
    });
});
//# sourceMappingURL=index.js.map