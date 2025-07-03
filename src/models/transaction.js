const mongoose = require("mongoose");
const Tag = require("./tag");
const Mode = require("./mode");
const Entity = require("./entity");
const Category = require("./category");

const transactionSchema = new mongoose.Schema({
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
                if(!_id) return true;
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

transactionSchema.methods.toJSON = function () {
    let transactionObject = this.toObject();
    delete transactionObject._id;
    delete transactionObject.author;
    return transactionObject;
}

// accepts an array of transactions
transactionSchema.statics.enrichBulk = async function (transactions) {
    const tags = {}, entities = {}, categories = {}, modes = {};
    return await Promise.all(transactions.map(async t => {
        t.tags = await Promise.all(t.tags.map(async (tag) => {
            if(tags[tag]) return tags[tag];
            tags[tag] = (await Tag.findById(tag) || {}).description;
            return tags[tag];
        }));
        t.entities = await Promise.all(t.entities.map(async (entity) => {
            if(entities[entity]) return entities[entity];
            entities[entity] = (await Entity.findById(entity) || {}).description;
            return entities[entity];
        }));
        if(categories[t.category]) t.category = categories[t.category];
        else {
            categories[t.category] = ((await Category.findById(t.category || null)) || {}).description;
            t.category = categories[t.category];
        }
        if(modes[t.mode]) return modes[t.mode];
        else {
            modes[t.mode] = ((await Mode.findById(t.mode || null)) || {}).description;
            t.mode = modes[t.mode];
        }
        return t;
    }));
}

transactionSchema.statics.enrich = async function (transaction) {
    transaction.tags = await Promise.all(transaction.tags.map(async (tag) => (await Tag.findById(tag) || {}).description));
    transaction.entities = await Promise.all(transaction.entities.map(async (entity) => (await Entity.findById(entity) || {}).description));
    transaction.category = ((await Category.findById(transaction.category || null)) || {}).description;
    transaction.mode = ((await Mode.findById(transaction.mode || null)) || {}).description;
    return transaction;
}

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction