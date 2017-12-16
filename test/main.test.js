import { expect } from 'chai';

describe('Smoke test', function() {
  it('tests', function() {
    expect(true).to.equal(true).and.be.a('Boolean');
    expect(42).to.equal(42).and.be.a('Number');
  });
});
