const mongooseLib = require('mongoose');

const taskSchema = new mongooseLib.Schema({ 
    description: {
        type: String,
        required: true,
        trim: true
    }, 
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongooseLib.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Task = mongooseLib.model('Task', taskSchema);

module.exports = Task;