import libxml from 'libxmljs'
import fetch from 'node-fetch'

export const fetchXml = (url, tries=0) => {
  return new Promise((resolve, reject) => {
    return fetch(url, {
      method: 'GET',
      compress: true,
      timeout: 20000
    }).then(res => res.buffer())
    .then(buf => {
      const xml = libxml.parseXml(buf)
      return resolve(xml)
    }).catch(err => {
      if (tries === 3)
        return process.exit(504)
      Promise.delay(500).then(() => fetchXml(url, tries + 1))
        .then(resolve)
    })
  })
}

export const ODDSTYPES = {
  threeway: 0,
  moneyline: 1,
  points: 3,
  totals: 4,
  ahc: 5,
  totalsht: 65540,
  threewayht: 65536,
  dnb: 6291457,
  totalcorners: 9437188,
  totalcornersht: 9502724,
  ehc: 8388608
}