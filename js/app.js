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
        setWeaponsInstances() { //METHODE LANCEMENT DU POSITIONNEMENT INITIAL DES JOUEURS
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
                    randomPlayerPosition = randomPositionSelect(Math.floor(freeGameboardCases.length / 2) + width, freeGameboardCases.length);
                    playerPosition = freeGameboardCases[randomPlayerPosition];
                    setFinalPlayerPosition(randomPlayerPosition, playerPosition, this);
                    break;
            }
        }
        drawPath(playerFullPath) {//METHODE DEFINITION DU CHEMIN POSSIBLE DU JOUEUR
            let playerId = this.playerId;
            //On reçoit un tableau qui contient 4 tableaux qui comportent des numéros qui sont les 12 cases autour du joueur horizontalement et verticalement (3 x 4)
            $.each(playerFullPath, function () { //On parcourt la liste des 4 tableaux
                $.each(this, function () { //On parcourt les numéros des tableaux pour vérifier s'il s'agit sur le plateau d'un mur
                    if ($(gameboardCases[this]).hasClass('wall') || $(gameboardCases[this]).hasClass('wall') || $(gameboardCases[this]).hasClass('player')) {
                        return false;
                    } else {
                        $(gameboardCases[this]).addClass(playerId + 'Path'); //Si c'est libre on ajoute le chemin du joueur
                    }
                })
            })
        }
        unDraw() {//METHODE SUPPRESSION IMAGE DU JOUEUR JOUEUR ET SON CHEMIN
            let playerPathClass = this.playerId + 'Path'; //On fabrique la variable "class" du chemin en fonction du joueur
            $('div').removeClass(playerPathClass); //On supprime les cases "chemin" via leur classe
            $('#' + this.playerId + ' img').remove();
            $('#' + this.playerId).removeClass('player');
            $('#' + this.playerId).removeAttr('id'); //On supprime le joueur de l'écran via son ID
        }
        setPlayerPosition(newPosition) {
            let currentPlayer;
            let otherPlayer;
            if (this.playerId == 'Player1') {
                currentPlayer = player1;
                otherPlayer = player2;
            } else {
                currentPlayer = player2;
                otherPlayer = player1;
            }
            this.unDraw();//ON EFFACE LE JOUEUR DE SON EMPLACEMENT ACTUEL
            this.dropWeapon();//LE JOUEUR LÂCHE SON ARME ACTUELLE
            var playerPosition = gameboardCases[newPosition];
            this.getWeapon(playerPosition);//LE JOUEUR RAMASSE UNE ARME
            $(playerPosition).attr('id', this.playerId);
            $(playerPosition).addClass("player");
            $(playerPosition).append('<img src="css/images/' + this.playerId + '.png">');
            this.playerPosition = newPosition;
            let player1position = player1.playerPosition;
            if (this.playerId == 'Player1') {
                game(player2);
            } else {
                game(player1);
            }
        }
        lookAround() {//PREPARATION DU CHEMIN DU JOUEUR
            var playerCase = ($('#' + this.playerId).index());
            var playerXpathLeft = [playerCase - (width / width), playerCase - (width * 2 / width), playerCase - (width * 3 / width)];
            var playerXpathRight = [playerCase + (width / width), playerCase + (width * 2 / width), playerCase + (width * 3 / width)];
            var playerYpathTop = [playerCase - width, playerCase - (width * 2), playerCase - (width * 3)];
            var playerYpathBottom = [playerCase + width, playerCase + 2 * width, playerCase + 3 * width];
            switch (playerCase % width) {//GESTION DES PATH SUR L'AXE DES X POUR LES BORDS DU PLATEAU DE JEU
                case 0:
                    playerXpathLeft.splice(0, 3);
                    break;
                case 1:
                    playerXpathLeft.splice(1, 2)
                    break;
                case 2:
                    playerXpathLeft.pop();
                    break;
                case 9:
                    playerXpathRight.splice(0, 3);
                    break;
                case 8:
                    playerXpathRight.splice(1, 2)
                    break;
                case 7:
                    playerXpathRight.pop();
                    break;
            }
            if (playerCase >= 20 && playerCase <= 29) {//GESTION DES PATH SUR L'AXE DES Y POUR LES BORDS DU PLATEAU DE JEU
                playerYpathTop.pop();
            } else if (playerCase >= 10 && playerCase <= 19) {
                playerYpathTop.splice(1, 2);
            } else if (playerCase >= 0 && playerCase <= 9) {
                playerYpathTop.splice(0, 3);
            }
            if (playerCase >= 70 && playerCase <= 79) {
                playerYpathBottom.pop();
            }
            else if (playerCase >= 80 && playerCase <= 89) {
                playerYpathBottom.splice(1, 2);
            } else if (playerCase >= 90 && playerCase <= 99) {
                playerYpathBottom.splice(0, 3);
            }
            var playerFullPath = [playerXpathLeft, playerXpathRight, playerYpathTop, playerYpathBottom];
            this.drawPath(playerFullPath);
        }
        move(player) {//DEPLACEMENT DU JOUEUR
            updateInterface('#playerTurnName', "C'est à " + this.playerName + ' de jouer !', 'text');
            $('#playerStatus' + this.playerId).css('border', '#20acff solid 2px');
            $('#gameboard div').click(function () {
                let playerPathClass = player.playerId + 'Path';
                if (!$(this).attr('class') == undefined || $(this).hasClass(playerPathClass)) {
                    let nextPosition = $(this).index();
                    player.setPlayerPosition(nextPosition);
                    $('#playerStatus' + player.playerId).css('border', '#20acff solid 0px');
                }
            });
        }
        dropWeapon() {//DEPOT D'UNE ARME SUR LE PLATEAU DE JEU
            if (this.playerOldWeapon != null) {
                $(gameboardCases[this.playerPosition]).attr('id', this.playerOldWeapon);
                $(gameboardCases[this.playerPosition]).addClass(' weapon');
                $(gameboardCases[this.playerPosition]).append('<img class="weaponImg" src="css/images/' + this.playerOldWeapon + '.png">');
                this.playerOldWeapon = null;
            }
        }
        getWeapon(playerPosition) {//RAMASSAGE D'UNE ARME
            if (playerPosition.id != '' && $(playerPosition).hasClass('weapon')) {
                var newWeapon = eval(playerPosition.id);
                $('#' + newWeapon.weaponId + ' img').remove();
                this.playerOldWeapon = this.playerWeapon.weaponId;
                this.playerWeapon = newWeapon;
                updateInterface('#' + this.playerId + 'Weapon', newWeapon.weaponName, 'text');
                updateInterface('#' + this.playerId + 'WeaponAttack', newWeapon.weaponAttack, 'text');
                $('#' + this.playerId + 'WeaponImgSpan img').remove();
                updateInterface('#' + this.playerId + 'WeaponImgSpan', '<img class="InterfaceWeaponImg" src="css/images/' + this.playerWeapon.weaponId + '.png">', 'append')
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
        setInitialWeaponPosition() {//PLACEMENT DES ARMES
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
    function game(player) {
        player.lookAround();
        setTimeout(move(player), 1000);
        function move(player) {
            player.move(player)
        }
    }
    function setInterface() {//GESTION DE L'INTERFACE DU JEU
        $(players).each(function () {
            $('#' + this.playerId + 'Name').text(this.playerName);
            $('#' + this.playerId + 'Life').text(this.playerLife);
            $('#' + this.playerId + 'Weapon').text(this.playerWeapon.weaponName);
            $('#' + this.playerId + 'WeaponAttack').text(this.playerWeapon.weaponAttack);
            $('#' + this.playerId + 'WeaponImgSpan').append('<img class="InterfaceWeaponImg" src="css/images/' + this.playerWeapon.weaponId + '.png">');
        });
    }
    function updateInterface(target, content, action) {//MISE A JOUR DES CHAMPS DE L'INTERFACE DU JEU
        if (action == 'text') {
            $(target).text(content);
        } else {
            $(target).append(content);
        }
    }

    function randomPositionSelect(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function setFinalPlayerPosition(randomPlayerPosition, playerPosition, player) {
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

        setInterface(); //INITIALISATION DE L'INTERFACE

        game(player1); //LANCEMENT DU TOUR DU JOUEUR 1
    }
    //ECRAN PRINCIPAL AVANT LE JEU, ON RECUPERE LE NOM DE CHAQUE JOUEUR
    initializeGameboard();
    $('#gameInterface').fadeIn();
    $('.playersWeaponAttack').fadeIn();
    $('#gameboard').css('border', '#20acff 2px solid');
});