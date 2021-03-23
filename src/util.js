const AU = require('ansi_up');
const ansiup = new AU.default;

/**
 * Strip ANSI and Aardwolf-style color tags from a string.
 * @param {string} str - string to be modified
 */
function fix_colors(str) {
  return ansiup.ansi_to_html(str);
}

/**
 * Extension of built-in Map to provide a default value.
 */
class DefaultMap extends Map {
  /**
   * Create a DefaultMap
   * @param {*} getDefaultValue - function generating the default value
   * @param  {...any} mapConstructorArgs - standard Map constructor arguments
   */
  constructor(getDefaultValue, ...mapConstructorArgs) {
    super(mapConstructorArgs);

    if (typeof getDefaultValue !== 'function') {
      throw new Error('getDefaultValue must be a function');
    }

    this.getDefaultValue = getDefaultValue;
  }

  /**
   * Get the value associated with a key, or the default value.
   * @param {} key
   */
  get(key) {
    if (!this.has(key)) {
      this.set(key, this.getDefaultValue(key));
    }

    return super.get(key);
  };
};

export { DefaultMap, fix_colors };
