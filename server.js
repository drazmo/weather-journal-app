// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');
const bodyParser = require('body-parser');

// Start up an instance of app
const app = express();
const port = 3000

// Cors for cross origin allowance
const cors = require('cors');

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize the main project folder
console.log("Using static site" + __dirname + '/website');
app.use(express.static(__dirname + '/website'));

// Initialize all route with a callback function
app.get('/all', (req, res) => {
    let data = getProjectData();
    res.json(data);
});

// Callback function to complete GET '/all'
function getProjectData() {
    return { journal: projectData };
}

// Post Route
app.post('/journal', (req, res) => {
    if (isEmptyObject(req.body)) {
        res.status(404).json({ status: 'failed' });
    } else {
        let key = Math.round(new Date().getTime() / 1000).toString();
        projectData[key] = req.body;
        res.json({ status: 'success' });
    }
});

// Setup Server
app.listen(port, () => {
    console.log(`Weather Journal server listening at http://localhost:${port}`)
})

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}