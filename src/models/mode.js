const mongoose = require("mongoose");

const modeSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 20
    },
    order: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

modeSchema.index(
  { author: 1, order: 1 },
  { unique: true }
);
modeSchema.index(
    { author: 1, description: 1 },
    { unique: true }
);

modeSchema.methods.toJSON = function() {
    let modeObject = this.toObject();
    delete modeObject.author;
    return modeObject;
};

const Mode = mongoose.model("Mode", modeSchema);

module.exports = Mode