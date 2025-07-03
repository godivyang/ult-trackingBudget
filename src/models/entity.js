const mongoose = require("mongoose");

const entitySchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 20,
        validate: {
            validator: async function(description) {
                let entity = await Entity.findOne({ description, author: this.author });
                if(entity) return false;
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

entitySchema.methods.toJSON = function() {
    let entObject = this.toObject();
    delete entObject.author;
    return entObject;
};

const Entity = mongoose.model("Entity", entitySchema);

module.exports = Entity;