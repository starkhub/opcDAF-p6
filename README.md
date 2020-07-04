# opcDAF-p6
Projet 6 du parcours Développeur Applications Front-End openClassrooms - Créez un jeu de plateau tour par tour en JS

URL : https://jeremie-holer.fr/projects/projet6/

# Résumé
Le jeu consistera à créer un jeu en ligne en Javascript dans lequel 2 joueurs évoluent chacun leur tour pour s'affronter. A l'issu du combat un seul joueur est déclaré vainqueur.

Le projet se compose de 3 étapes :

## Étape 1

- Générer aléatoirement une carte de jeu, chaque case est soit libre soit innaccessible
- Sur la carte, un nombre limité d'armes (4 maxi) sera placé aléatoirement et pourra être récolté par les joueurs lorsqu'ils passent dessus
- Les armes ont toutes des points de dégâts différents, celle qui équipe les joueurs par défaut en inflige 10
- Chaque arme a un nom et un visuel associé
- Le placement des joueurs est aléatoire. Ils ne doivent pas se trouver (ils ne peuvent pas être côte côte)

## Étape 2

- A chaque tour, un joueur peut se déplacer d'une à trois cases (horizontalement ou verticalement) avant de finir son tour
- Un joueur ne peut tout naturellement pas passer à travers un obstacle
- Lorsqu'un joueur passe sur une case qui contient une arme, il laisse son arme actuelle sur place et la remplace par la nouvelle

## Étape 3

- Si les joueurs se croisent sur des cases adjacentes (horizontalement ou verticalement) le combat est lancé
- Lors d'un combat le fonctionnement du jeu est le suivant :
> Chacun attaque à son tour
> Les dégâts infligés dépendent des points d'attaque de l'arme possédée par le joueur
> Lorsque le joueur se défend, il encaisse 50% de dégâts en moins qu'en temps normal
> Dès que les points de vie d'un joueur tombent à 0, celui-ci a perdu. (Points de vie par défaut : 100)
> Un message s'affiche et la partie est terminée

# Livrables
Code HTML/CSS/JS des différentes étapes

# Statut du projet

**Validation à venir...
