const mongoose = require("mongoose");

const entitySchema = mongoose.Schema({
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

entitySchema.index(
  { author: 1, order: 1 },
  { unique: true }
);
entitySchema.index(
    { author: 1, description: 1 },
    { unique: true }
);

entitySchema.methods.toJSON = function() {
    let entObject = this.toObject();
    delete entObject.author;
    return entObject;
};

const Entity = mongoose.model("Entity", entitySchema);

module.exports = Entity;