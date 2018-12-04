import D, { Dict } from './dict';
import List from './list';
import Maybe from './maybe';

interface CustomTypeInstance {
  key: string;
  values: Array<any>;
}

const custom = (options: Dict<string, Array<any>>) => {
  const out = D.map(
    (key, params) => (...values) => {
      // validate values
      return { key, values } as CustomTypeInstance;
    },
    options,
  );

  return D.insert(
    'match',
    (on: CustomTypeInstance, cases: Dict<string, Function>) => {
      const optionsKeys = D.keys(options);
      const casesKeys = D.keys(cases);
      let missing;
      if (!List.member('_', casesKeys)) {
        missing = List.filter(key => !List.member(key, casesKeys), optionsKeys);
      }
      const extra = List.filter(
        key => !List.member(key, optionsKeys),
        casesKeys,
      );

      if (List.length(missing) > 0) {
        throw new Error();
      }

      if (List.length(extra) > 0) {
        throw new Error();
      }

      return Maybe.withDefault(() => {}, D.get(on.key, cases))(...on.values);
    },
    out,
  );
};

export default { custom };

/*
import { Opaque } from './opaque';

// interface CustomType {
//   __values: CustomTypeInterface,
//   [key: string]: CustomTypeValue,
// }

type CustomTypeValue = Function;

interface CustomTypeInterface {
  [key: string]: Array<CustomTypeParam>
};

type CustomTypeParam = StringParam | IntParam | string;

type StringParam = Opaque<'StringParam', '__string'>;
type IntParam = Opaque<'IntParam', '__int'>;

const custom = (types) => {
  return {
    ...mapValues((params, name) => {
      return (...values) => {
        return { name, params: values }
      }
    }, types),
    __types: types
  }

  // TODO: Update in ts 3.3.0, see https://github.com/Microsoft/TypeScript/pull/26797
  // return Symbol(name);
  // return name as CustomType;
};

const withFn = (type: CustomType, ...params): CustomTypeInstance => {
  if (!areParamsValid(type, params)) throw new Error('invalid params');
  return { type, params } as CustomTypeInstance;
};

const matchOn = (instance: CustomTypeInstance, matcher): any => {
  if (!matcher[instance.type]) {
    if (matcher._) {
      return matcher._();
    }
    throw new Error('incomplete matcher');
  }
  return matcher[instance.type](...instance.params);
};

// const custom = (name: string, ...paramTypes) => {
//   const fn = (...params) => {
//     params.forEach((param, index) => {
//       if (typeof paramTypes[index] === 'undefined') {
//         throw new Error('too many params');
//       }
//       if (paramTypes[index] === string) {
//         if (typeof param !== 'string') throw new Error('not a string');
//       }
//       if (paramTypes[index] === int) {
//         if (typeof param !== 'number') throw new Error('not an int');
//       }
//     });
//     return { name, params } as TypeInstance;
//   };
//   return fn;
// };

// const matchOn = (instance: TypeInstance, matcher): void => {
//   if (matcher[instance.name]) {
//     matcher[instance.name](...instance.params);
//   }
// };

const string = Symbol('Type.string');
const int = Symbol('Type.int');

export default { custom, matchOn, with: withFn, string, int };
*/
