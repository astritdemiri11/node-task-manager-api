require('./db/mongoose');
const expressLib = require('express');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = expressLib();

app.use(expressLib.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;