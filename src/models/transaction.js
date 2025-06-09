const mongoose = require("mongoose");
const Tag = require("./tag");
const Mode = require("./mode");
const Entity = require("./entity");
const Category = require("./category");

const Transaction = mongoose.model("Transaction", {
    date: {
        type: Date,
        default: new Date()
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount should be a non-negative integer."]
    },
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        validate: {
            validator: async function(_id) {
                let category = await Category.findOne({ _id, author: this.author });
                if(category) return true;
                return false;
            },
            message: props => `${props.value} is not a valid category!`
        }
    },
    description: {
        type: String,
        trim: true
    },
    motive: {
        type: String
    },
    mode: {
        type: String,
        validate: {
            validator: async function(_id) {
                let mode = await Mode.findOne({ _id, author: this.author });
                if(mode) return true;
                return false;
            },
            message: props => `${props.value} is not a valid mode!`
        }
    },
    entities: {
        type: Array,
        validate: {
            validator: async function(entities) {
                for(let _id of entities) {
                    let entity = await Entity.findOne({ _id, author: this.author });
                    if(!entity) return false;
                }
                return true;
            },
            message: props => `${props.value} is not a valid entity!`
        }
    },
    tags: {
        type: Array,
        validate: {
            validator: async function(tags) {
                for(let _id of tags) {
                    let tag = await Tag.findOne({ _id, author: this.author });
                    if(!tag) return false;
                }
                return true;
            },
            message: props => `${props.value} is not a valid tag!`
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = Transaction