import mongoose from 'mongoose'

const timestampSchema = mongoose.Schema({
  _id: {
    type: Number
  },
  timestamp: {
    type: Number
  }
})

timestampSchema.statics.getMain = function() {
  return new Promise((resolve, reject) => {
    this.findOne({_id: 1})
      .then(timestamp => {
        if (!!timestamp)
          return resolve(timestamp)
        return this.create({_id: 1, timestamp: 0})
      }).then(resolve)
      .catch(reject)
  })
}

timestampSchema.statics.updateMain = function(timestamp) {
  return this.update({_id: 1}, {$set: {timestamp: timestamp}})
}

export default mongoose.model('Timestamp', timestampSchema)
