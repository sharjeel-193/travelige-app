const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {MONGOURI} = require('./config/keys')
const PORT = process.env.PORT || 5000;
const cors = require ('cors')

app.use(cors())

require('./models/user.model')
require('./models/post.model');

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

//Mongo DB Database connection
mongoose.connect(MONGOURI,{
    useNewUrlParser: true, 
    useCreateIndex: true,
    useFindAndModify: false, 
    useUnifiedTopology: true 
})
const connection = mongoose.connection;
connection.on('connected', () => {
    console.log("Connected to Mongo Yeah");
})
connection.on('error', (err => {
    console.log("ERROR in connecting")
}))

//PORT LISTEN

if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    const path = require('path')
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname),'client','build','index.html')
    })
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // console.log(MONGO_URI);
})