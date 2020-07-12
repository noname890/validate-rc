// custom constructor overrides
const overrides: any = {
	// @ts-ignore
	[Number]: class {
		constructor(private num: any) {
			if (isNaN(this.num) || (this.num === true || this.num === false)) {
				// is not a number so we throw
				// it doesn't matter wht we write inside the error
				throw new ValidationError('Number', this.num.constructor.name);
			}
		}
	},
	// @ts-ignore
	[String]: class {
		constructor(private str: any) {
			if (typeof this.str !== 'string') {
				throw new ValidationError('String', this.str.constructor.name);
			}
		}
	},
	// @ts-ignore
	[Boolean]: class {
		constructor(private bool: any) {
			if (this.bool !== true && this.bool !== false) {
				throw new ValidationError('Boolean', this.bool.constructor.name);
			}
		}
	},
	// @ts-ignore
	[Array]: class {
		constructor(private arr: any) {
			if (!Array.isArray(this.arr)) {
				throw new ValidationError('Array', this.arr.constructor.name);
			}
		}
	},
	// @ts-ignore
	[Object]: class {
		constructor(private obj: any) {
			if (!isObject(this.obj)) {
				throw new ValidationError('Object', this.obj.constructor.name);
			}
		}
	},
	// @ts-ignore
	[Function]: class {
		constructor(private fn: any) {
			if (typeof this.fn !== 'function') {
				throw new ValidationError('Function', this.fn.constructor.name);
			}
		}
	}
};

/**
 * Checks if something is an object
 * @param obj The object to check
 */
function isObject(obj: object): boolean {
	return !!obj && obj.constructor === Object;
}

export class ValidationError extends Error {
	public name = 'ValidationError';
	public readonly VALIDATION_ERROR = true;

	constructor(public expects: string, public got: string) {
		super('Please handle this error, for more information: https://github.com/noname890/validate-rc');
	}
}

/**
 * Creates an entirely optional branch in the RC
 * @param rules The Rules of the config
 * @example
 * const rules = {
 * 	address: Optional(String)
 * }
 * 
 * validateRc(rules, {}) // => true
 * validateRc(rules, { address: 'Foo Bar street' }) // => true
 * validateRc(rules, { address: 1 }) // => throws, because `address` is specified, but it is not a `String`
 */
export function Optional(rules: object | Function): Function {
	return class {
		constructor(private rc: object) {
			try {
				if (typeof rules !== 'object') {
					// rules is not an object, so to pass it to validateRc
					// we have to create a fake object
					const fakeRule = { RULE: rules };
					const fakeRc = { RULE: this.rc };

					if (this.rc) {
						validateRc(fakeRule, fakeRc);
					}
				} else {
					if (this.rc) {
						validateRc(rules, this.rc);
					}
				}
			} catch (e) {
				if (e.VALIDATION_ERROR) {
					throw new ValidationError(rules ? rules.constructor.name : 'undefined', e.got);
				}
				throw e;
			}
		}
	};
}

/**
 * Expects a value that is in choices, otherwise throws
 * @param choiches The avaliable choices
 * @example
 * const rules = {
 * 	os: Choice('linux', 'macos', 'windows')
 * }
 * 
 * validateRc(rules, { os: 'linux' }) // => true
 * validateRc(rules, { os: 'macos' }) // => true
 * validateRc(rules, { os: 'windows' }) // => true
 * validateRc(rules, { os: 'freebsd' }) // => throws, because `freebsd` isn't in `Choice`
 */
export function Choice(...choiches: any[]): Function {
	return class {
		constructor(private rc: any) {
			if (!choiches.includes(this.rc)) {
				throw new ValidationError(choiches.map((val) => "'" + val + "'").join(', '), `'${this.rc}'`);
			}
		}
	};
}

/**
 * Class that doesn't throw, so it matches everything
 * @example
 * const rules = {
 * 	custom: Any
 * }
 * validateRc(rules, {}) // => true
 * validateRc(rules, { custom: 42 }) // => true
 * validateRc(rules, { custom: 'string' }) // => true
 * validateRc(rules, { custom: [ 'array', 'of', 'strings' ] }) // => true
 * validateRc(rules, { custom: { objects: true } }) // => true
 * validateRc(rules, { custom: _ => _ }) // => true
 */
export class Any {
	constructor() {}
}

/**
 * Validates a config file, returns true if it follows `rules`
 * @param rules The rules of the config file
 * @param rc The config file
 * @example
 * import validateRc, { Optional } from 'validateRc'
 * 
 * // the rules that the config should follow
 * const rules = {
 * 	name: String,
 * 	age: Number,
 * 	// Optional() will not throw if it is `undefined` in the config,
 * 	// but it will throw if it is present in the config and doesn't follow
 * 	// the rules
 *     hobbies: Optional(Array)
 * }
 * 
 * // pass the rules and the rc
 * validateRc(rules, { name: 'Michael', age: 27 }) // => true
 * validateRc(rules, { name: 'Michael', age: 27, hobbies: [ 'Sport', 'Climbing' ] }) // => true
 * validateRc(rules, { name: 'Michael', age: NaN, hobbies: [ 'Sport', 'Climbing' ] }) // => throws, because age is NaN
 * validateRc(rules, { name: 'Michael', age: 27, hobbies: 'Sport' }) // => throws, because `hobbies` is present and isn't an `Array`
 */
export default function validateRc(rules: any, rc: any): boolean | never {
	for (const i in rules) {
		if (overrides[rules[i]]) {
			// validate, `rules[i]` can be any constructor, even a user-defined one
			new overrides[rules[i]](rc[i]);
		} else if (typeof rules[i] === 'object' && !Array.isArray(rules[i])) {
			validateRc(rules[i], rc[i]);
		} else {
			new rules[i](rc[i]);
		}
	}

	return true;
}
