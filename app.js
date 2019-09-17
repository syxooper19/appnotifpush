const express = require('express');
const app = express();

const webpush = require('web-push');
const vapidKeys = require('./vapid.json');

// initialise le module webpush avec les clefs VAPId et les informations de contact
webpush.setVapidDetails(
    'mailto:bastien.roussel.19@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);


const dbSub = require('./subscriptions.js');
dbSub.initDb();


const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Push App!')
});

app.get('/api/get-vapid-public-key', (req, res) => {
    res.send({ vapidkey: vapidKeys.publicKey })
});

app.get('/api/endpoints', (req, res) => {
    dbSub.getAllEndpoints()
        .then( (rows) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ list: rows }));
        })
        .catch( (err) => {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                error: {
                    id: 'unable-to-get-all-endpoints',
                    message: 'Database error : '+err.message
                }
            }));
        })
});

app.post('/api/save-subscription/', (req, res) => {
    if (!isValidSaveRequest(req, res)) {
        return;
    }

    return dbSub.saveSubscription(req.body)
        .then(function(subscriptionId) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ data: { success: true } }));
        })
        .catch(function(err) {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                error: {
                    id: 'unable-to-save-subscription',
                    message: 'The subscription was received but we were unable to save it to our database.'
                }
            }));
        });
});

app.post('/api/trigger-push-msg', (req,res) => {

    let msg = req.body;

    dbSub.getAllEndpoints()
        .then( (rows) => {

            let all_push = new Promise( (resolve , reject ) => {
                let nbrPush = rows.length;
                let status = [];
                rows.forEach( (row) => {
                    webpush.sendNotification(row.subscritor, JSON.stringify(msg))
                        .then((detail_req) => {
                            status.push( detail_req.statusCode );
                            console.log("then:"+nbrPush);
                            if ( --nbrPush === 0)
                                resolve( status );
                        })
                        .catch((err) => {
                            if (err.statusCode === 410) {
                                dbSub.delSubscription(row.id);
                            } else {
                                console.log('Subscription is no longer valid: ', err);
                            }
                            status.push( err.statusCode );
                            console.log("catch:"+nbrPush);
                            if ( --nbrPush === 0)
                                resolve( status );
                        });
                });

            });
            all_push.then((statusList) => {
                res.send(JSON.stringify(statusList));
            });
    });
});

app.use(express.static('public'));

app.listen(process.env.PORT || 80, function () {
//app.listen(80, function () {
    console.log('Push server start!')
});




const isValidSaveRequest = (req, res) => {
    // Check the request body has at least an endpoint.
    if (!req.body || !req.body.endpoint) {
        // Not a valid subscription.
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            error: {
                id: 'no-endpoint',
                message: 'Subscription must have an endpoint.'
            }
        }));
        return false;
    }
    return true;
};

const triggerPushMsg = (subscription, dataToSend) => {
    return webpush.sendNotification(subscription.subscritor, JSON.stringify(dataToSend))

};
