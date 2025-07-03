const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 20,
        validate: {
            validator: async function(description) {
                let category = await Category.findOne({ description, author: this.author });
                if(category) return false;
                return true;
            },
            message: props => `${props.value} already exist!`
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

categorySchema.methods.toJSON = function() {
    let catObject = this.toObject();
    delete catObject.author;
    return catObject;
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category