import _ from 'underscore';
import underscoreDeepExtend from 'underscore-deep-extend';

_.mixin({
  deepExtend: underscoreDeepExtend(_)
});

class AbstractType {

  constructor(isOptional, defaultValue, typeName) {
    this._isOptional = isOptional ? true : false;
    this.defaultValue = defaultValue;
    this._typeName = typeName;
  }

  _getCheckValue(value) {
    return !value && this.defaultValue !== undefined ? this.defaultValue : value;
  }

  isOptional(isOptional) {
    this._isOptional = true;
    return this;
  }

  validate(value, valueName) {
    let result = this.validateValue(value);
    let self = this;

    if (!result) {
      throw `${valueName ? valueName + ': ' : ''}The given value is not valid. Type ${JSON.stringify(this, null, 2)}. Value: ${JSON.stringify(value, null, 2)}`;
    }

    return result;
  }

  validateValue(value, valueName) {
    let result = this._validateValue(value);

    if (!result) {
      console.warn(`${valueName ? valueName + ': ' : ''}The given value is not valid. Type ${JSON.stringify(this, null, 2)}. Value: ${JSON.stringify(value, null, 2)}`);
    }

    return result;
  }

  _validateValue(value) {
    return this._isOptional || value !== undefined;
  }

  validateValueFalse(value, valueName) {
    return !this.validateValue(value, valueName);
  }

  valueOrDefault(value) {
    return this._getCheckValue();
  }

  withDefault(defaultValue) {
    this.defaultValue = defaultValue;
    this._isOptional = true;
    return this;
  }

}

class AnyProp extends AbstractType {

  constructor(ofType, isOptional, defaultValue) {
    super(isOptional, defaultValue);
    this.ofType = ofType;
  }

  _validateValue(value) {
    return super._validateValue(value)
      && (this._getCheckValue(value) === undefined || (!(this.ofType && _.isFunction(this.ofType)) || this.ofType(value)))
      && (this._getCheckValue(value) === undefined || (!(this.ofType && _.isArray(this.ofType)) || _.findIndex(this.ofType, (type) => type.validateValue(this._getCheckValue)) > -1));
  }

}

class ArrayProp extends AbstractType {

  constructor(ofType, isOptional, defaultValue) {
    super(isOptional, defaultValue, 'Array');
    this.ofType = ofType;
  }

  _validateValue(value) {
    return super._validateValue(value)
      && (this._getCheckValue(value) === undefined || _.isArray(this._getCheckValue(value)))
      && (this._getCheckValue(value) === undefined || (!this.ofType || _.findIndex(this._getCheckValue(value), this.ofType.validateValueFalse, this.ofType) === -1));
  }

}

class BoolProp extends AbstractType {

  constructor(isOptional, defaultValue) {
    super(isOptional, defaultValue, 'Boolean');
  }

  _validateValue(value) {
    return super._validateValue(value)
      && (this._getCheckValue(value) === undefined || _.isBoolean(this._getCheckValue(value)));
  }

}

class EnumProp extends AbstractType {

  constructor(values, isOptional, defaultValue) {
    super(isOptional, defaultValue, `Enumeration of ${values}`);
    (new ArrayProp().validate(values, 'Parameter "values"'));

    this.values = values;
  }

  _validateValue(value) {
    return super._validateValue(value)
      && (this._getCheckValue(value) === undefined || _.indexOf(this.values, this._getCheckValue(value)) > -1);
  }

}

class FuncProp extends AbstractType {

  constructor(isOptional, defaultValue) {
    super(isOptional, defaultValue, 'Function');
  }

  _validateValue(value) {
    return super._validateValue(value)
      && (this._getCheckValue(value) === undefined || _.isFunction(this._getCheckValue(value)));
  }

}

class NumberProp extends AbstractType {

  constructor(isOptional, defaultValue) {
    super(isOptional, defaultValue, 'Number');
  }

  _validateValue(value) {
    return super._validateValue(value)
      && (this._getCheckValue(value) === undefined || _.isNumber(this._getCheckValue(value)));
  }

}

class ObjectProp extends AbstractType {

  constructor(ofType, isOptional, defaultValue) {
    super(isOptional, defaultValue, 'Object');
    this.ofType = ofType;
  }

  _validateValue(value) {
    let checkFields = key => {
      return this.ofType[key].validateValueFalse(this._getCheckValue(value[key]), key);
    };

    return super._validateValue(value)
      && (this._getCheckValue(value) === undefined || _.isObject(this._getCheckValue(value)))
      // && (!(this.ofType && _.isArray(this.ofType)) || _.findIndex(_.values(this._getCheckValue(value), this), this.ofType.validateValueFalse) === -1)
      && (this._getCheckValue(value) === undefined || (!(this.ofType && _.isObject(this.ofType)) || _.chain(this.ofType).keys().findIndex(checkFields, this).value() === -1));
  }

  valueOrDefault(value) {
    if (this.ofType && _.isObject(this.ofType) && !this.defaultValue) {
      let v = value ? _.deepExtend({}, value) : {};
      _.each(this.ofType, (type, key) => {
        if (type.defaultValue) {
          v[key] = type.valueOrDefault(v[key]);
        }
      });
      return v;
    } else {
      return super.valueOrDefault(value);
    }
  }

}

class StringProp extends AbstractType {

  constructor(isOptional, defaultValue) {
    super(isOptional, defaultValue, 'String');
  }

  _validateValue(value) {
    return super._validateValue(value)
      && (value === undefined || _.isString(this._getCheckValue(value)));
  }

}

export default {

  any: (ofType, isOptional, defaultValue) => {
    return new AnyProp(ofType, isOptional, defaultValue);
  },

  array: (ofType, isOptional, defaultValue) => {
    return new ArrayProp(ofType, isOptional, defaultValue);
  },

  bool: (isOptional, defaultValue) => {
    return new BoolProp(isOptional, defaultValue);
  },

  func: (isOptional, defaultValue) => {
    return new FuncProp(isOptional, defaultValue);
  },

  number: (isOptional, defaultValue) => {
    return new NumberProp(isOptional, defaultValue);
  },

  object: (ofType, isOptional, defaultValue) => {
    return new ObjectProp(ofType, isOptional, defaultValue);
  },

  oneOf: (values, isOptional, defaultValue) => {
    return new EnumProp(values, isOptional, defaultValue);
  },

  string: (isOptional, defaultValue) => {
    return new StringProp(isOptional, defaultValue);
  }

};
