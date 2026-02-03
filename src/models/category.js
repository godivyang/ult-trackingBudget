const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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

// setting index on order and description prevents any duplicates
categorySchema.index(
  { author: 1, order: 1 },
  { unique: true }
);
categorySchema.index(
  { author: 1, description: 1 },
  { unique: true }
);

categorySchema.methods.toJSON = function() {
    let catObject = this.toObject();
    delete catObject.author;
    return catObject;
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category