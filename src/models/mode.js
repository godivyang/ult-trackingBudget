const mongoose = require("mongoose");

const modeSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 20,
        validate: {
            validator: async function(description) {
                let mode = await Mode.findOne({ description, author: this.author });
                if(mode) return false;
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

modeSchema.methods.toJSON = function() {
    let modeObject = this.toObject();
    delete modeObject.author;
    return modeObject;
};

const Mode = mongoose.model("Mode", modeSchema);

module.exports = Mode