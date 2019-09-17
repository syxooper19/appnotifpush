self.addEventListener('push', function(event) {
    let msg = event.data.json()
    const promiseChain = self.registration.showNotification(msg.title, msg.options);

    event.waitUntil(promiseChain);

});
