const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now, required: true },
    dateUpdated: { type: Date, default: Date.now, required: true },
    lastLogin: { type: Date },
    status: { type: String, default: 'active' },
    budgets:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Budget' }]
    
});

const User = mongoose.model('User', userSchema);

module.exports = User;
