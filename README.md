# CHAT IRC
***
Chat similaire à discord, avec une interface web Vue.JS, une sauvegarde des messages et des logs dans une base de données MongoDB
***
## Lancement
Lancer le serveur:
```bash
cd server
npm start
```
Lancer l'application web:
```bash
cd client
npm start
```
***
## Commandes chat
Commandes disponibles dans le chat:
* /nick [name] : Change le nom de l'utilisateur courant
* /join [room] : Redirige l'utilisateur dans le channel spécifié
* /list : Liste les channels disponibles
* /list [query] : Liste les channels dont le nom comprend la recherche
* /users : Liste les utilisateurs présents dans le chat
* /create [room] : Créer un salon et y redirige l'utilisateur
* /rename [room] : Change le nom du channel actuel
* /quit : Déconnecte l'utilisateur
* /delete [room] : Supprime un channel hors de celui où se trouve l'utilisateur actuellement
* /help : Liste toutes les commandes et le fonctionnalités de celles-ci
