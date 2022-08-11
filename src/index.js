const express = require('express');
const multer = require('multer');
const route = require('./routes/routes.js');
const mongoose = require('mongoose');
const app = express();



app.use(express.json());
app.use(multer().any())




mongoose.connect("mongodb+srv://REYNIL310609:OnIYmcfVuOkV0Dkr@cluster0.csvzw.mongodb.net/wowTalent?retryWrites=true&w=majority",
    { useNewUrlParser: true }
)
.then(() => console.log('mongodb is connected'))
.catch(err => console.log(err))


app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
