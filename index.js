/* eslint-disable no-magic-numbers */

/*
 *
 * Decentralized Record of Value
 * DRV200: Non-Fungible Record
 *
 */

const { capitalizeSlug, generateUUID } = require('cryptography-utilities');

module.exports = ({ drv, peers, serviceEvents }) => {

  /*
   * Import DRV100 for its transfer logic.
   */

  const DRVContract = require('drv100')({
    drv,
    peers,
    serviceEvents
  });

  /*
   * Define a contract that: Accepts an encoded string as
   * the DRV value instead of a number, creates a file,
   * populates it with the encoded content as formatted JSON,
   * then generates a user-friendly magnet link for distributed
   * access.
   */

  const Contract = async ({
    token,
    sender,
    recipient,
    recipientAddress,
    usdValue,
    drvValue = 'data:drv/text;text,Hello world!'
  }) => {
    if (drvValue.substring(0, 9) === 'data:drv/') {
      const encoding = drvValue === 'text' ? 'text' : 'json';
      const drvContent = drvValue.split(`;${encoding}`);
      const contentType = drvContent[0].replace(/data:drv\//, '');

      // TODO: Validate and cache file
      // const content = encoding === 'text'
      //   ? drvValue.split(/data\:drv\/.*;text,/)
      //   : drvValue.split(/data\:drv\/.*;json,/);

      // eslint-disable-next-line no-param-reassign
      drvValue = `::magnet=?xt=urn:drv/${contentType}:${generateUUID()}&dn=${capitalizeSlug(contentType)}`;
    }

    /*
     * Invoke the modified DRV100 with the encoded record.
     */

    return DRVContract({
      token,
      sender,
      recipient,
      recipientAddress,
      contract: 'DRV200',
      usdValue,
      drvValue,
      isDrv: true
    });
  };

  return Contract;
};
