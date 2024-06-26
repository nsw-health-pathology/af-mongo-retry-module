import chai, { expect } from 'chai';
import { } from 'mocha';

import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { DefaultRetryPolicy } from '../src';

describe('DefaultRetryPolicy', () => {
  it('shouldRetry', async () => {

    const pol = new DefaultRetryPolicy(1);

    await expect(pol.shouldRetry()).to.be.eventually.equal(true);
    return expect(pol.shouldRetry()).to.be.eventually.equal(false);
  });
});
