/**
 * Vérifie que le navigatuer est compatible
 * Possède Push API
 * Return true si c'est ok
 */
function checkBrowser() {
    return (('serviceWorker' in navigator) && ('PushManager' in window));
}

/**
 * Conversion de la clef VAPID pour la subscription
 * @param base64String
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Avant de s'enregistrer comme subscriber, on récupère la clef public VAPID
 */
function subscribeUserToPush() {
    fetch('/api/get-vapid-public-key')
        .then(function(response) {
            return response.json();
        })
        .then(startServiceWorker)
}

/**
 *  Cette fonction charge en tâche de fond le service-worker
 * Le service-worker est
 *  - downloader sur le poste client du browser
 *  - Le javascript est ecécuté
 *  - Si tout c'est passé sans erreur alors la promise est excécuté avec succé et retour un ServiceWorkerRegistration
 *
 * Le ServiceWorkerRegistration va nous permettre d'accéder à l'API Push Manager est suscrire au push server
 * @param jsonKey
 * @returns {Promise<Response>}
 */
function startServiceWorker(jsonKey) {
    return navigator.serviceWorker.register('js/service-worker.js')
        .then(function(registration) {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(jsonKey.vapidkey)
            };

            return registration.pushManager.subscribe(subscribeOptions);
        })
        .then(function(pushSubscription) {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return sendSubscriptionToBackEnd( pushSubscription );
        });
}

/**
 * Return une promise, ainsi la demande d'autorisation à l'utilisateur
 * peut se faire en asynchrone
 * @returns {Promise<any>}
 */
function askPermission() {
    return new Promise(function (resolve, reject) {

        Notification.requestPermission().then(function (result) {
            //
            if (result === 'denied') {
                reject('La permission n\'a pas été validé, les notifications sont bloquées');
            }
            if (result === 'default') {
                reject('La réponse à la requête pour la permission a été remis à plus tard.');
            }
            // Do something with the granted permission.
            resolve();
        })
    })
}


/**
 * Renvoie au serveur le endpoint que la subscription a donné
 * @param subscription
 * @returns {Promise<Response>}
 */
function sendSubscriptionToBackEnd(subscription) {
    return fetch('/api/save-subscription/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
    })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Bad status code from server.');
            }

            return response.json();
        })
        .then(function(responseData) {
            if (!(responseData.data && responseData.data.success)) {
                throw new Error('Bad response from server.');
            }
        });
}
