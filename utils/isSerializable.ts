import _ from "lodash";

const isSerializable = function(obj: any) {
    if (_.isUndefined(obj) ||
        _.isNull(obj) ||
        _.isBoolean(obj) ||
        _.isNumber(obj) ||
        _.isString(obj)) {
        return true;
    }

    if (!_.isPlainObject(obj) &&
        !_.isArray(obj)) {
        return false;
    }

    for (let key in obj) {
        if (!isSerializable(obj[key])) {
            return false;
        }
    }

    return true;
}

export default isSerializable;