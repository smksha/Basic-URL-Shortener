const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

var admin = require("firebase-admin");
var serviceAccount = require("./urlshortening-e8028-firebase-adminsdk-r56j6-1121caa335.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const static = express.static("public");
const urlsdb = admin.firestore().collection("urlsdb");
const usersdb = admin.firestore().collection("usersdb");

app.use(static); //middleware
app.use(bodyParser.json());

app.get('/:short', (req, res) => {
    console.log(req.params);
    const short = req.params.short;
    const doc = urlsdb.doc(short); //document in firebase is a row
    doc.get().then(response => {
        const data = response.data();
        if (data && data.url) {
            res.redirect(301, data.url);
        }
        else {
            res.redirect(301, `http://localhost:${port}`)
        }
    });
})

app.post('/admin/urls/', (req, res) => {
    const { email, password, shortUrl, url } = req.body;
    usersdb.doc(email).get().then(response => {
        const user = response.data();
        if (user) {
            if ((user.email == email) && (user.password == password)) {
                const doc = urlsdb.doc(shortUrl);
                doc.set({ url });
                res.send("Success!");
            }
            else{
                res.send(401, "User is unauthorized !");
            }
        }
        else{
            res.send(403, "Not possible!")
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})