import mongoose from 'mongoose'
import Promise from 'bluebird'
import raven from 'raven'

global.Promise = mongoose.Promise = Promise
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}
import '../models'


export const ODDSFEED_BASE_URL = `http://xml2.txodds.com/feed/odds/xml.php?ident=gjelstabet&passwd=8678y7u7&live=0&spid=${process.env.SPORTS}&bid=83&ot=${process.env.ODDS_TYPES}&days=0,2&all_odds=2`

export const ODDSFEED_URL = `http://xml2.txodds.com/feed/odds/xml.php?ident=gjelstabet&passwd=8678y7u7&live=0&spid=${process.env.SPORTS}&bid=${process.env.BOOKMAKERS}&ot=${process.env.ODDS_TYPES}&date=now,now+1day&all_odds=2`


const options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } }

export const initializeDatabase = () => {
  mongoose.connection.on('disconnected', () => console.log('Disconnected'))
  mongoose.connection.on('reconnected', () => console.log('Reconnected'))
  mongoose.connection.on('error', err => console.log('MONGO ERROR', err))
  return mongoose.connect(process.env.DATABASE_URL, options)
}

export const FETCH_ODDS_INTERVAL = 10000

export const ravenClient = new raven.Client('https://7143a9aad1944d688d7e53c6e23a3888:bc900e1248e844aa92a4de9d868f48a0@sentry.io/115926');
if (process.env.NODE_ENV === 'production')
  ravenClient.patchGlobal()
