'use strict';

const mocha = require('mocha');
const Test = mocha.Test;
const Suite = mocha.Suite;
const globalTimeout = Number(process.env.TEST_GLOBAL_TIMEOUT);

module.exports = function(root) {
  root.on('require', (obj) => {
    if (typeof obj !== 'function' && typeof obj.default !== 'function') {
      return;
    }

    const Ctr = typeof obj === 'function' ? obj : obj.default;
    const instance = new Ctr();
    const suite = Suite.create(root, Ctr.name);

    Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
      .filter(name => name.startsWith('test'))
      .filter(name => typeof instance[name] === 'function')
      .forEach(name => {
        const title = typeof instance[`${name}Title`] === 'string' ?
         instance[`${name}Title`] : name;

        const test = new Test(title, () => instance[name]());
        suite.addTest(test);

        if (Number.isFinite(globalTimeout)) {
          test.timeout(globalTimeout);
        } else if (typeof instance[`${name}Timeout`] === 'number') {
          test.timeout(instance[`${name}Timeout`]);
        }
      });
  });
};
