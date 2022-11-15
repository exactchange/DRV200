/* eslint-disable no-magic-numbers */

/*
 *
 * Decentralized Record of Value
 * DRV200: Non-Fungible Record
 *
 */

const { capitalizeSlug } = require('cryptography-utilities');

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
    sender,
    recipient,
    recipientAddress,
    usdValue,
    drvValue = 'data:drv/text;text,Hello world!'
  }) => {
    if (drvValue.substring(0, 9) === 'data:drv/') {
      const encoding = drvValue.substring(9, 13) === 'text' ? 'text' : 'json';
      const drvContent = drvValue.split(`;${encoding}`);
      const contentType = drvContent[0].replace(/data:drv\//, '');

      const content = encoding === 'text'
        ? drvValue.split(/data\:drv\/.*;text,/)[1]
        : drvValue.split(/data\:drv\/.*;json,/)[1];

      if (encoding === 'text') {

        /*
         * Save text records directly on-chain
         */

        // eslint-disable-next-line no-param-reassign
        drvValue = `::magnet=?xt=urn:drv/text&dn=${encodeURIComponent(content)}&ts=${Date.now()}`;
      } else {

        /*
         * Cache JSON records in DSS
         */

        const file = await drv.onHttpPost(
          {
            method: 'store',
            body: {
              content
            },
            route: {
              path: '/'
            },
            path: 'store'
          },
          {
            status: code => ({
              end: () => ({
                error: {
                  code,
                  message: '<DRV200> Contract error (POST).'
                }
              })
            }),
            send: body => ({
              status: 200,
              success: true,
              data: body
            })
          }
        );

        const fileName = file.split('/')[1];

        // eslint-disable-next-line no-param-reassign
        drvValue = `::magnet=?xt=urn:drv/${contentType}:${fileName}&dn=${capitalizeSlug(contentType)}`;
      }
    }

    /*
     * Invoke the modified DRV100 with the encoded record.
     */

    return DRVContract({
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
