var expect = require('expect.js');

describe('test', function () {
  it('should run tests', function () {
    expect(true).to.be(true);
  });
  it('should not fail', function () {
    expect(false).to.be(false);
  });
});