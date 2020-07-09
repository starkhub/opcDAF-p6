$(window).on('load', function () {

    //DEFINITION ET INITIALISATION DES CONSTANTES DU JEU
    const gameboardDiv = $('#gameboard'); // DIV principal du plateau de jeu
    const gbCasesAmount = 100; // Nombre de cases
    const gbWallsAmount = 15; // Nombre de murs
    const width = 10; // Indice de largeur par défaut
    var player1Name = 'Joueur 1'; //Initialisation nom du joueur 1
    var player2Name = 'Joueur 2'; //Initialisation nom du joueur 2
    var gameboardCases; //Initialisation du tableau des cases du plateau de jeu

    class Gameboard {//DECLARATION CLASSE DU PLATEAU DE JEU
        constructor(gameboardDiv, gbCasesAmount, gbWallsAmount) {
            this.gameboardDiv = gameboardDiv;
            this.gbCasesAmount = gbCasesAmount;
            this.gbWallsAmount = gbWallsAmount;
        }
        setGameboard() {//METHODE GENERATION DES CASES DU PLATEAU DE JEU
            return new Promise((resolve) => {
                let y = 0;
                let i;
                setTimeout(() => {
                    for (i = 0; i < this.gbCasesAmount; i++) {
                        $(this.gameboardDiv).append('<div class="floor">');
                        y++;
                    }
                    resolve(y)
                }, 200)
            });
        }
        setWalls() {//METHODE GENERATION DES MURS (AJOUT DE LA CLASSE CSS WALL)
            return new Promise((resolve) => {
                let y = 0;
                let i;
                setTimeout(() => {
                    for (i = 0; i < this.gbWallsAmount; i++) {
                        do {
                            var loopSwitch = true;
                            let randomWallPosition = randomPositionSelect(0, gbCasesAmount);
                            let wallPosition = gameboardCases[randomWallPosition];
                            let wallSurround = [$(gameboardCases[randomWallPosition - (width - 1)]), $(gameboardCases[randomWallPosition - (width + 1)]), $(gameboardCases[randomWallPosition + (width - 1)]), $(gameboardCases[randomWallPosition + (width + 1)])];

                            if ($(wallPosition).hasClass('wall') || wallSurround.some(item => $(item).hasClass('wall'))) {
                                loopSwitch = true;
                            } else {
                                $(wallPosition).addClass('wall');
                                loopSwitch = false;
                                y++;
                            }
                        } while (loopSwitch != false)
                    }
                    resolve(y)
                }, 200)
            });
        }
        setWeaponsInstances() { //METHODE LANCEMENT DU POSITIONNEMENT INITIAL DES ARMES
            return new Promise((resolve) => {
                let y = 0;
                let i;
                setTimeout(() => {
                    $.each(weapons, function () {
                        this.setInitialWeaponPosition();//Placement des armes sur le plateau de jeu
                        y++;
                    })
                    resolve(y)
                }, 200)
            });
        }
        setPlayersInstances() { //METHODE LANCEMENT DU POSITIONNEMENT INITIAL DES JOUEURS
            return new Promise((resolve) => {
                let y = 0;
                let i;
                setTimeout(() => {
                    $.each(players, function () {
                        this.setInitialPlayerPosition();//Placement des joueurs sur le plateau de jeu
                        y++;
                    })
                    resolve(y)
                }, 200)
            });
        }
    }
    class Player {//DECLARATION CLASSE DU JOUEUR
        constructor(playerId, playerName, playerLife, playerWeapon, playerPosition) {
            this.playerId = playerId;
            this.playerName = playerName;
            this.playerLife = playerLife;
            this.playerWeapon = playerWeapon;
            this.playerPosition = playerPosition;
            this.playerOldWeapon = null;
            this.playerGuard = null;
        }

        setInitialPlayerPosition() {//METHODE PLACEMENT INITIAL DES JOUEURS
            let randomPlayerPosition;
            let playerPosition;
            var freeGameboardCases = gameboardCases.filter(function (result) {
                return !$(result).hasClass('wall') && !$(result).hasClass('weapon');
            });
            switch (this.playerId) {
                case 'Player1':
                    randomPlayerPosition = randomPositionSelect(0, (Math.floor(freeGameboardCases.length / 2)) - width);
                    playerPosition = freeGameboardCases[randomPlayerPosition];
                    setFinalPlayerPosition(randomPlayerPosition, playerPosition, this);
                    break;
                case 'Player2':
                    randomPlayerPosition = randomPositionSelect(Math.floor(freeGameboardCases.length / 2) + width , freeGameboardCases.length);
                    playerPosition = freeGameboardCases[randomPlayerPosition];
                    setFinalPlayerPosition(randomPlayerPosition, playerPosition, this);
                    break;
            }
        }
        unDraw() {//METHODE SUPPRESSION IMAGE DU JOUEUR JOUEUR ET SON CHEMIN
            let playerPathClass = this.playerId + 'Path'; //On fabrique la variable "class" du chemin en fonction du joueur
            $('div').removeClass(playerPathClass); //On supprime les cases "chemin" via leur classe
            $('#' + this.playerId + ' img').remove();
            $('#' + this.playerId).removeClass('player');
            $('#' + this.playerId).removeAttr('id'); //On supprime le joueur de l'écran via son ID
        }
        setPlayerPosition(newPosition) {//METHODE PLACEMENT DU JOUEUR LORS DE DEPLACEMENT
            let currentPlayer;
            let otherPlayer;
            if (this.playerId == 'Player1') {
                currentPlayer = player1;
                otherPlayer = player2;
            } else {
                currentPlayer = player2;
                otherPlayer = player1;
            }
            $(playerPosition).attr('id', this.playerId);
            $(playerPosition).addClass("player");
            $(playerPosition).append('<img src="css/images/' + this.playerId + '.png">');
            this.playerPosition = newPosition;
            if (this.playerId == 'Player1') {
                game(player2);
            } else {
                game(player1);
            }
        }
    }
    class Weapon {//CLASSE D'UNE ARME
        constructor(weaponId, weaponName, weaponType, weaponAttack) {
            this.weaponId = weaponId;
            this.weaponName = weaponName;
            this.weaponType = weaponType;
            this.weaponAttack = weaponAttack;;
            this.weaponPosition = null;
        }
        setInitialWeaponPosition() {//METHODE PLACEMENT DES ARMES
            do {
                var loopSwitch = true;
                let randomWeaponPosition = randomPositionSelect(0, gbCasesAmount);
                let weaponPosition = gameboardCases[randomWeaponPosition];
                if ($(weaponPosition).hasClass('wall') || $(weaponPosition).attr('id') != undefined || $(weaponPosition).hasClass('weapon')) {
                    loopSwitch = true;
                } else {
                    $(weaponPosition).attr('id', this.weaponId);
                    $(weaponPosition).addClass(' weapon');
                    $(weaponPosition).append('<img class="weaponImg" src="css/images/' + this.weaponId + '.png">');
                    this.weaponPosition = weaponPosition;
                    loopSwitch = false;
                }
            } while (loopSwitch != false)
        }
    }
    //CREATION INSTANCE ET MISE EN PLACE DU PLATEAU DE JEU
    const gameBoard = new Gameboard(gameboardDiv, gbCasesAmount, gbWallsAmount);
    //CREATION ET PLACEMENT DES INSTANCES DES ARMES
    const weapon1 = new Weapon("weapon1", "DH-17", "blaster", 10); //arme par défaut du joueur 1
    const weapon2 = new Weapon("weapon2", "DH-18", "blaster", 10); //arme par défaut du joueur 2
    const weapon3 = new Weapon("weapon3", "E-11", "blaster", 20);
    const weapon4 = new Weapon("weapon4", "EE-4", "blaster", 30);
    const weapon5 = new Weapon("weapon5", "DL-44", "blaster", 40);
    const weapon6 = new Weapon("weapon6", "Sabre Laser", "lightSaber", 50);
    const weapons = [weapon3, weapon4, weapon5, weapon6];
    //CREATION ET PLACEMENT DES INSTANCES DE JOUEURS
    const player1 = new Player("Player1", player1Name, 100, weapon1, null);
    const player2 = new Player("Player2", player2Name, 100, weapon2, null);
    const players = [player1, player2]; //Création d'un tableau contenant player1 et player2
    //FONCTION PRINCIPALE LANCANT LE TOUR DU JOUEUR

    function randomPositionSelect(min, max) {//SELECTION D'UNE POSITION ALEATOIRE
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function setFinalPlayerPosition(randomPlayerPosition, playerPosition, player){//POSITIONNEMENT INITIAL DU JOUEUR
        $(playerPosition).attr('id', player.playerId);
        $(playerPosition).addClass('player');
        $(playerPosition).append('<img src="css/images/' + player.playerId + '.png">');
        player.playerPosition = randomPlayerPosition;
        player.playerWeapon.weaponPosition = randomPlayerPosition;
    }

    async function initializeGameboard() {//INITIALISATION DU JEU (MISE EN PLACE DU PLATEAU) PARTIE-1
        await gameBoard.setGameboard();//On attend que la mise en place du plateau soit finie pour continuer...
        gameboardCases = $('#gameboard div').toArray();
        intializeGame();
    }
    async function intializeGame() {//INITIALISATION DU JEU (MISE EN PLACE DU PLATEAU) PARTIE-2
        await gameBoard.setWalls();//On attend que la mise en place des murs soit finie pour continuer...

        await gameBoard.setWeaponsInstances();

        await gameBoard.setPlayersInstances();

    }
    initializeGameboard();
});