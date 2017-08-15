import mongoose from 'mongoose'

export const Odds = mongoose.Schema({
  o1: {
    type: Number
  },
  o2: {
    type: Number
  },
  o3: {
    type: Number
  },
  o4: {
    type: Number
  },
  time: {
    type: Date
  }
})

const offerSchema = mongoose.Schema({
  _id: {
    type: Number
  },
  oddsType: {
    type: Number
  },
  bookmaker: Number,
  lastUpdated: {
    type: Date,
    index: true
  },
  flags: {
    type: Boolean,
    index: true
  },
  bmoid: {
    type: String
  },
  match: {
    type: Number,
    ref: 'Match',
    index: true
  },
  odds: [Odds],
  lastModified: Date
})

offerSchema.statics.upsertBulk = function(offers) {
  if (offers.length === 0)
    return Promise.resolve()
  let bulk = this.collection.initializeUnorderedBulkOp()
  offers.forEach(offer => {
    bulk.find({_id: offer._id}).upsert().update({
      '$set': {
        lastUpdated: offer.lastUpdated,
        flags: offer.flags,
      },
      $push: {
        odds: offer.odds
      },
      '$setOnInsert': {
        _id: offer._id,
        match: offer.match,
        oddsType: offer.oddsType,
        bookmaker: offer.bookmaker
      }
    })
  })
  return bulk.execute()
}

export default mongoose.model('Offer', offerSchema)
