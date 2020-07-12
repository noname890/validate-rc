/* eslint-env mocha */

import validateRc, { Optional, Choice, Any } from './index';
import { expect } from 'chai';

describe('validateRc', () => {
	describe('primitives', () => {
		describe('String', () => {
			it('should return true', () => {
				expect(validateRc({ str: String }, { str: 'this is a test' })).to.be.equal(true);
			});
			it('should throw if undefined', () => {
				expect(() => validateRc({ str: String }, {})).to.throw();
			});
			it('should throw if is not a string', () => {
				expect(() => validateRc({ str: String }, { str: true })).to.throw();
			});
		});

		describe('Number', () => {
			it('should return true', () => {
				expect(validateRc({ num: Number }, { num: 42 })).to.be.equal(true);
			});
			it('should throw if undefined', () => {
				expect(() => validateRc({ num: Number }, {})).to.throw();
			});
			it('should throw if is not a number', () => {
				expect(() => validateRc({ num: Number }, { num: 'string' })).to.throw;
			});
		});

		describe('Array', () => {
			it('should return true', () => {
				expect(validateRc({ arr: Array }, { arr: [ 'this', 'is', 'a', 'test' ] })).to.be.equal(true);
			});
			it('should throw if undefined', () => {
				expect(() => validateRc({ arr: Array }, {})).to.throw();
			});
			it('should throw if is not an array', () => {
				expect(() => validateRc({ arr: Array }, { arr: 'string' })).to.throw();
			});
		});

		describe('Boolean', () => {
			it('should return true', () => {
				expect(validateRc({ bool: Boolean }, { bool: true })).to.be.equal(true);
			});
			it('should throw if undefined', () => {
				expect(() => validateRc({ bool: Boolean }, {})).to.throw();
			});
			it('should throw if is not a bool', () => {
				expect(() => validateRc({ bool: Boolean }, { bool: 1 })).to.throw();
			});
		});

		describe('Object', () => {
			it('should return true', () => {
				expect(validateRc({ obj: Object }, { obj: {} })).to.be.equal(true);
			});
			it('should throw if undefined', () => {
				expect(() => validateRc({ obj: Object }, {})).to.throw();
			});
			it('should throw if is not an object', () => {
				expect(() => validateRc({ obj: Object }, { obj: [ 'test' ] })).to.throw();
			});
		});

		describe('Function', () => {
			it('should return true', () => {
				expect(validateRc({ fn: Function }, { fn: () => {} })).to.be.equal(true);
			});
			it('should throw if undefined', () => {
				expect(() => validateRc({ fn: Function }, {})).to.throw();
			});
			it('should throw if is not a function', () => {
				expect(() => validateRc({ fn: Function }, { fn: 'string' })).to.throw();
			});
		});
	});

	describe('Optional', () => {
		it('should be a function', () => {
			expect(Optional).to.be.instanceOf(Function);
		});

		describe('String', () => {
			it('should return true', () => {
				expect(validateRc({ str: Optional(String) }, { str: 'this is a string' })).to.be.equal(true);
			});
			it('should not throw if is undefined', () => {
				expect(() => validateRc({ str: Optional(String) }, {})).to.not.throw();
			});
			it('should throw if is not a string', () => {
				expect(() => validateRc({ str: Optional(String) }, { str: 42 })).to.throw();
			});
		});

		describe('Number', () => {
			it('should return true', () => {
				expect(validateRc({ num: Optional(Number) }, { num: 42 })).to.be.equal(true);
			});
			it('should not throw if it is undefined', () => {
				expect(() => validateRc({ num: Optional(Number) }, {})).to.not.throw();
			});
			it('should throw if is not a number', () => {
				expect(() => validateRc({ num: Optional(Number) }, { num: true })).to.throw();
			});
		});

		describe('Array', () => {
			it('should return true', () => {
				expect(validateRc({ arr: Optional(Array) }, { arr: [] })).to.be.equal(true);
			});
			it('should not throw if undefined', () => {
				expect(() => validateRc({ arr: Optional(Array) }, {})).to.not.throw();
			});
			it('should throw if is not an array', () => {
				expect(() => validateRc({ arr: Optional(Array) }, { arr: {} })).to.throw();
			});
		});

		describe('Boolean', () => {
			it('should return true', () => {
				expect(validateRc({ bool: Optional(Boolean) }, { bool: true })).to.be.equal(true);
			});
			it('should not throw if is undefined', () => {
				expect(() => validateRc({ bool: Optional(Boolean) }, {})).to.not.throw();
			});
			it('should throw if is not a bool', () => {
				expect(() => validateRc({ bool: Boolean }, { bool: 42 })).to.throw();
			});
		});

		describe('Object', () => {
			it('should return true', () => {
				expect(validateRc({ obj: Optional(Object) }, { obj: {} })).to.be.equal(true);
			});
			it('should not throw if undefined', () => {
				expect(() => validateRc({ obj: Optional(Object) }, {})).to.not.throw();
			});
			it('should throw if is not an object', () => {
				expect(() => validateRc({ obj: Optional(Object) }, { obj: [] })).to.throw();
			});
		});

		describe('Function', () => {
			it('should return true', () => {
				expect(validateRc({ fn: Optional(Function) }, { fn: () => {} })).to.be.equal(true);
			});
			it('should not throw if undefined', () => {
				expect(() => validateRc({ fn: Optional(Function) }, {})).to.not.throw();
			});
			it('should throw if is not a function', () => {
				expect(() => validateRc({ fn: Optional(Function) }, { fn: true })).to.throw();
			});
		});

		describe('Branches', () => {
			it('should return true', () => {
				expect(validateRc({ branch: Optional({ inside: Boolean }) }, { branch: { inside: true } })).to.be.equal(
					true
				);
			});
			it('should not throw if is undefined', () => {
				expect(() => validateRc({ branch: Optional({ inside: Boolean }) }, {})).to.not.throw();
			});
			it('should throw if is not a branch', () => {
				expect(() => validateRc({ branch: Optional({ inside: Boolean }) }, { branch: true })).to.throw();
			});
			it('should throw if branch rules are violated', () => {
				expect(() =>
					validateRc({ branch: Optional({ inside: Boolean }) }, { branch: { inside: 42 } })
				).to.throw();
			});
		});

		describe('Choice', () => {
			it('should return true', () => {
				expect(validateRc({ choice: Optional(Choice('foo', 'bar')) }, { choice: 'foo' })).to.be.equal(true);
			});
			it('should not throw if undefined', () => {
				expect(() => validateRc({ choice: Optional(Choice('foo', 'bar')) }, {})).to.not.throw();
			});
			it('should throw if its not a choice', () => {
				expect(() => validateRc({ choice: Optional(Choice('foo', 'bar')) }, { choice: 'baz' })).to.throw();
			});
		});
	});

	describe('Choice', () => {
		it('should return true', () => {
			expect(validateRc({ choice: Choice('foo', 'bar') }, { choice: 'foo' })).to.be.equal(true);
		});
		it('should throw if is undefined', () => {
			expect(() => validateRc({ choice: Choice('foo', 'bar') }, {})).to.throw();
		});
		it('should throw if its not a choice', () => {
			expect(() => validateRc({ choice: Choice('foo', 'bar') }, { choice: 'baz' })).to.throw();
		});
	});

	describe('Any', () => {
		const rule = { any: Any };

		it('should never throw', () => {
			expect(() => validateRc(rule, {})).to.not.throw();
			expect(() => validateRc(rule, { any: 42 })).to.not.throw();
			expect(() => validateRc(rule, { any: 'true' })).to.not.throw();
			expect(() => validateRc(rule, { any: true })).to.not.throw();
			expect(() => validateRc(rule, { any: [ true ] })).to.not.throw();
			expect(() => validateRc(rule, { any: { branch: true } })).to.not.throw();
			expect(() => validateRc(rule, { any: () => {} })).to.not.throw();
		});
	});
});
