/* eslint-disable no-case-declarations, no-magic-numbers */

/**
 * Non Fungible Records are stored on the public chain as Magnetic Resource Text (MRT)
 * which closely inherits from the Magnet URI scheme ('magnet links')
 * See: https://en.wikipedia.org/wiki/Magnet_URI_scheme
 *
 * Data files are stored in directories specified in that node's configuration
 * in the following formats.
 * See: https://github.com/exactchange/dss
 */

const DRV200Input = {
  type: 'Alias|Comment|Collectible',
  datetime: 'string'
};

const Authentication = {
  type: 'email|uri',
  value: 'string'
};

/**
 * Content Types
 */

const Alias = {
  ...DRV200Input,

  type: 'Alias',
  address: 'string',
  name: 'string',
  auth: {
    ...Authentication
  }
};

const Comment = {
  ...DRV200Input,

  type: 'Comment',
  author: 'string',
  text: 'string'
};

const Collectible = {
  ...DRV200Input,

  type: 'Collectible',
  vintage: 'number',
  make: 'string',
  model: 'string',
  condition: 'bad|good|mint|new|digital',
  appraisal: 'number',
  appraisalCurrency: 'USD',
  value: 'string'
};

/**
 * Union string types are preserved as strings
 * Use this helper to split it into a list during type checks
 */

const toArray = (string = '') => string.split('|');

/**
 * Dates must be in ISO string format (UTC)
 */

const isISODate = (string = '') => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(string)) {
    return false;
  }

  const date = new Date(string);

  return (
    date instanceof Date &&
    !isNaN(date) && date.toISOString() === string
  );
};

module.exports = input => {
  /**
   * Validate `type` and `datetime` for all
   * content types
   */

  if (
    !toArray(DRV200Input.type).includes(input?.type) ||
    !isISODate(input?.datetime?.trim())
  ) {
    return false;
  }

  /**
   * Validate each content type
   */

  switch (input.type) {
    case 'Alias':
      const isValidName = /^[a-z0-9-.]{2,64}$/i.test(input.name);

      if (!isValidName) return false;

      const isValidAddress = input.address?.length === 36;

      if (!isValidAddress) return false;

      const isValidAuth = (
        toArray(Alias.auth.type).includes(input.auth?.type) &&
        Alias.auth.value === typeof (input.auth?.value)
      );

      if (!isValidAuth) return false;

      return true;

    case 'Comment':
      const isValidAuthor = (
        Comment.author === typeof (input.author)
      );

      if (!isValidAuthor) return false;

      const isValidText = (
        Comment.text === typeof (input.text) &&
        /^.{2,280}$/i.test(input.text)
      );

      if (!isValidText) return false;

      return true;

    case 'Collectible':
      const isValidVintage = (
        Collectible.vintage === typeof (input.vintage) &&
        `${input.vintage}`.length < 5
      );

      if (!isValidVintage) return false;

      const isValidMake = (
        Collectible.make === typeof (input.make) &&
        /^.{2,200}$/i.test(input.make)
      );

      if (!isValidMake) return false;

      const isValidModel = (
        Collectible.model === typeof (input.model) &&
        /^.{2,200}$/i.test(input.model)
      );

      if (!isValidModel) return false;

      const isValidCondition = (
        toArray(Collectible.condition).includes(input.condition.trim().toLowerCase())
      );

      if (!isValidCondition) return false;

      const isValidAppraisal = (
        Collectible.appraisal === typeof (input.appraisal)
      );

      if (!isValidAppraisal) return false;

      const isValidAppraisalCurrency = (
        Collectible.appraisalCurrency === input.appraisalCurrency.trim().toUpperCase()
      );

      if (!isValidAppraisalCurrency) return false;

      const isValidValue = (
        Collectible.value === typeof (input.value)
      );

      if (!isValidValue) return false;

      return true;
  }

  return false;
};

