const mongoose = require("mongoose");

const Mode = mongoose.model("Mode", {
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

module.exports = Mode