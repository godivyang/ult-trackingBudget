const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 20,
        validate: {
            validator: async function(description) {
                let tag = await Tag.findOne({ description, author: this.author });
                if(tag) return false;
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

tagSchema.methods.toJSON = function() {
    let tagObject = this.toObject();
    delete tagObject.author;
    return tagObject;
};

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;