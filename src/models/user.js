const mongooseLib = require('mongoose');
const validatorLib = require('validator');
const bcryptLib = require('bcryptjs');
const jwtLib = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongooseLib.Schema({ 
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validatorLib.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain "password" keyword');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate (value) {
            if(value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, { 
    timestamps: true
 });

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function () {
    const token = jwtLib.sign({ id: this.id.toString() }, process.env.JWT_SECRET);

    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcryptLib.compare(password, user.password);
    
    if(!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
};

userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcryptLib.hash(this.password, 8);
    }

    next();
});

userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id });
    
    next();
});

const User = mongooseLib.model('User', userSchema);

module.exports = User;