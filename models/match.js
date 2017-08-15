import mongoose from 'mongoose'

const matchSchema = mongoose.Schema({
  _id: {
    type: Number
  },
  homeTeam: {
    _id: {
      type: Number,
    },
    name: {
      type: String
    }
  },
  awayTeam: {
    _id: {
      type: Number,
    },
    name: {
      type: String
    }
  },
  startTime: {
    type: Date
  },
  competition: {
    _id: Number,
    name: String
  },
  sportId: Number,
  country: Number
})

matchSchema.statics.upsertBulk = function(matches) {
  if (matches.length === 0) {
    return Promise.resolve()
  }
  let bulk = this.collection.initializeOrderedBulkOp()
  matches.forEach(match => {
    bulk.find({_id: match._id}).upsert().update({
      '$set': {
        startTime: match.startTime
      },
      '$setOnInsert': {
        _id: match._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        competition: match.competition,
        sportId: match.sportId,
        country: match.country
      }
    })
  })
  return bulk.execute()
}

export default mongoose.model('Match', matchSchema)
