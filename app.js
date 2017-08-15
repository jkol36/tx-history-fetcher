import { ODDSFEED_BASE_URL, ODDSFEED_URL, initializeDatabase, ravenClient, FETCH_ODDS_INTERVAL } from './config'
import mongoose from 'mongoose'
import { fetchXml, ODDSTYPES } from './helpers'
import libxml from 'libxmljs'
import fetch from 'node-fetch'

let timestamp = 0

const getInitialUrls = () =>
  new Promise((resolve, reject) => {
    fetchXml(`http://xml2.txodds.com/feed/competitions.php?ident=gjelstabet&passwd=8678y7u7&active=1&sid=15,16,17&spid=${process.env.SPORTS}`)
      .then(xml => {
        const competitions = new Set()
        const nodes = xml.find('//competition')
        nodes.forEach(n => {
          competitions.add(+n.attr('cgid').value())
        })
        resolve([...competitions].map(id => ODDSFEED_BASE_URL + `&last=0&cgid=${id}`))
      })
  })

const runNormal = () => {
  const url = ODDSFEED_BASE_URL + `&last=${timestamp-5}`
  const timer = Date.now()
  let result
  fetchXml(url)
    .then(xml => parseOddsXml(xml))
    .then(res => {
      timestamp = res.timestamp
      return saveData(res)
    }).then(() => {
      const timeSpent = Date.now() - timer
      console.log('Spent %s ms', timeSpent)
      if (timeSpent > FETCH_ODDS_INTERVAL) {
        runNormal()
      } else {
        setTimeout(runNormal, FETCH_ODDS_INTERVAL - timeSpent)
      }
    })
}

const runInitial = () => {
  let tempTimestamp = Infinity
  let matches = []
  let offers = []
  return getInitialUrls()
    .then(urls => {
      return Promise.map(urls, (url, index, length) => {
      const percentageDone = 100 - (Math.round((index + 1) / length * 100 * 10) / 10)
      console.log(percentageDone)
      return fetchXml(url).then(parseOddsXml)
    }, { concurrency: 3})
    }).each(res => {
      if (res.timestamp < tempTimestamp)
        tempTimestamp = res.timestamp
      Array.prototype.push.apply(matches, res.matches)
      Array.prototype.push.apply(offers, res.offers)
    }).then(res => {
      timestamp = tempTimestamp
      return saveData({
        matches,
        offers,
        timestamp: tempTimestamp
      })
    })
}


const parseOddsXml = (xml, oddsMap, matchesMap) => {
  const timestamp = +xml.get('/matches').attr('timestamp').value()
  const xmlMatches = xml.find('//match')
  const offers = []
  const matches = []
  xmlMatches.forEach(m => {
    const match = {
      _id: +m.attr('id').value(),
      startTime: new Date(m.get('time').text()).getTime(),
      homeTeam: m.get('hteam').text(),
      awayTeam: m.get('ateam').text()
    }
    const group = m.get('group')
    match.sportId = +group.attr('spid').value()
    match.country = +group.attr('cnid').value()
    match.competition = {
      _id: +group.attr('cgid').value(),
      name: group.attr('cname').value()
    }
    matches.push(match)
    m.find('./bookmaker').forEach(b => {
      const bid = +b.attr('bid').value()
      b.find('./offer').forEach(o => {
        const odds = o.get('odds')
        const offer = {
          _id: +o.attr('id').value(),
          oddsType: +o.attr('ot').value(),
          lastUpdated: new Date(o.attr('last_updated').value()),
          flags: +o.attr('flags').value() === 1,
          bookmaker: bid,
          match: match._id
        }
        offer.odds = {
          o1: +odds.get('o1').text(),
          o2: +odds.get('o2').text(),
          time: new Date(odds.attr('time').value())
        }
        const o3 = odds.get('o3')
        offer.odds.o3 = o3.attr('dec') ? +o3.attr('dec').value() : +o3.text()
        if (offer.oddsType === ODDSTYPES.moneyline || offer.oddsType === ODDSTYPES.dnb)
          [offer.odds.o2, offer.odds.o3] = [offer.odds.o3, offer.odds.o2]
        const o4 = odds.get('o4')
        offer.odds.o4 = o4 && +o4.text()
        offers.push(offer)
      })
    })
  })
  return Promise.resolve({
    timestamp,
    offers,
    matches
  })
}

const saveData = (data) => {
  return Promise.all([
                     mongoose.model('Match').upsertBulk(data.matches),
                     mongoose.model('Offer').upsertBulk(data.offers),
                     mongoose.model('Timestamp').updateMain(data.timestamp)
                     ])
}

initializeDatabase()
  .then(() => runInitial())
  .then(() => runNormal())
