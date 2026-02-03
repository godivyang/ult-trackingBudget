const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
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

tagSchema.index(
  { author: 1, order: 1 },
  { unique: true }
);
tagSchema.index(
    { author: 1, description: 1 },
    { unique: true }
);

tagSchema.methods.toJSON = function() {
    let tagObject = this.toObject();
    delete tagObject.author;
    return tagObject;
};

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;