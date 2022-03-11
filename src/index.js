const app = require('./app');

app.listen(process.env.PORT, () => {
    console.log('Server is on port ' + process.env.PORT);
});

