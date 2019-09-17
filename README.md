## Env de dev

Pour le serveur, on utilise le framework node Express, mais tout autre solution est viable

    $ docker build -t node/push .
    $ docker run -p 80:80 --name push -v `pwd`:/push node/push
    
Pour chaque test il faut redemarrer le container

    $ docker stop push
    $ docker start push
    
## VAPID Keys
Les clefs, et plus particulièrement la clef privé, ne doit pas être versionné
Le fichier contient les clefs sous la forme json suivante

    module.exports = {
        publicKey: "BN..."
        privateKey: "gM..."
    };
    
Dans le fichier app.js le require contient le path du fichier vapideKeys.js

    const vapidKeys = require('./NOTversioned/vapidKeys.js');
    

# API

- Liste les endpoints  
Requête
```
    GET /api/endpoints
```
Réponse
```
{
    "list": [
        {
            "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABbpQmiuNGMdkEJ9wcTR-TWWerVRf...UrPl4YoCwz_Z0SBUyc5pklGK79JV84F9q6xp2XZj1M0sbN5nvtiajVQ4x-ZwtQ7-zfv4qtjx1XwBCNhawvSIK8eF9Cr9JRFM",
            "keys": {
                "auth": "avnGJ...0cfoHB5Y1g",
                "p256dh": "BP-qW_heXmmLuXpE745OiLeyM5s8DRTl3qg0df-edDWIvv-3AtYOsuFW...v7hNfq-JYyBgnVCCowe1k"
            }
        }
        {
        ...
        }
    ]
}
```

- Save un endpoints  
Requête
```
    POST /api/save-subscription/
```
Réponse
```
{
    "list": [
        {
            "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABbpQmiuNGMdkEJ9wcTR-TWWerVRf...UrPl4YoCwz_Z0SBUyc5pklGK79JV84F9q6xp2XZj1M0sbN5nvtiajVQ4x-ZwtQ7-zfv4qtjx1XwBCNhawvSIK8eF9Cr9JRFM",
            "keys": {
                "auth": "avnGJ...0cfoHB5Y1g",
                "p256dh": "BP-qW_heXmmLuXpE745OiLeyM5s8DRTl3qg0df-edDWIvv-3AtYOsuFW...v7hNfq-JYyBgnVCCowe1k"
            }
        }
        {
        ...
        }
    ]
}
```

- Trigger push msg  
Requête
```
    POST /api/trigger-push-msg
    [header]
    Content-Type:application/json
    [body] 
    {
    	"notification":
    	{
    		"title" : "test",
    		"body" :" ypoupi !"
    	}
    }
```

Réponse
```
[201, ...]
```
    
    
     