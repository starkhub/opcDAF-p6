$(window).on('load', function () {

    //DEFINITION ET INITIALISATION DES CONSTANTES DU JEU
    const gameboardDiv = $('#gameboard'); // DIV principal du plateau de jeu
    const gbCasesAmount = 100; // Nombre de cases
    const gbWallsAmount = 15; // Nombre de murs
    const width = 10; // Indice de largeur par défaut
    var player1Name;
    var player2Name;
    var gameboardCases;
    var sound = false;
    var music = false;
    var currentMusic;

    class Gameboard {//DECLARATION CLASSE DU PLATEAU DE JEU
        constructor(gameboardDiv, gbCasesAmount, gbWallsAmount) {
            this.gameboardDiv = gameboardDiv;
            this.gbCasesAmount = gbCasesAmount;
            this.gbWallsAmount = gbWallsAmount;
        }
        setGameboard() {//METHODE GENERATION DU PLATEAU DE JEU
            return new Promise((resolve, reject) => {
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
        setWalls() {//METHODE GENERATION MURS
            return new Promise((resolve, reject) => {
                let y = 0;
                let i;
                setTimeout(() => {
                    for (i = 0; i < this.gbWallsAmount; i++) {
                        do {
                            var loopSwitch = true;
                            let randomWallPosition = Math.floor(Math.random() * (gbCasesAmount - 1)) + 1;
                            let wallPosition = gameboardCases[randomWallPosition];
                            let wallSurround= [$(gameboardCases[randomWallPosition - (width-1)]), $(gameboardCases[randomWallPosition - (width+1)]), $(gameboardCases[randomWallPosition + (width-1)]), $(gameboardCases[randomWallPosition + (width+1)]) ];

                            if ($(wallPosition).hasClass('wall') || wallSurround.some(item => $(item).hasClass('wall')) ) {
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
            do {
                var loopSwitch = true; //Interrupteur de la boucle
                let randomPlayerPosition = Math.floor(Math.random() * (gbCasesAmount - 1)) + 1; //Génération d'un nombre aléatoire inclus dans le nombre de cases total du plateau
                let playerPosition = gameboardCases[randomPlayerPosition]; //Génération de la position potentielle du joueur
                if ($(playerPosition).hasClass('wall') || $(playerPosition).attr('id') != undefined || $(playerPosition).hasClass('weapon')) { //Check si la position potentielle possède déjà un mur
                    loopSwitch = true;
                } else { //Si la place est libre...
                    if (this.playerId == 'Player2') { //Le player 1 a déjà été placé, on s'assure que le joueur 2 soit placé à une distance suffisamment éloignée
                        let player1position = $('#Player1').index();
                        let player2position = $(playerPosition).index()
                        let playersDistance = Math.abs(player1position - player2position);
                        if (playersDistance < 50) { //Check de la distance entre les joueurs via le numéro de leur case respective
                            loopSwitch = true;
                        } else { //Si ils sont assez éloignés
                            $(playerPosition).attr('id', this.playerId);
                            $(playerPosition).addClass('player');
                            $(playerPosition).append('<img src="css/images/' + this.playerId + '.png">');
                            this.playerPosition = randomPlayerPosition;
                            this.playerWeapon.weaponPosition = randomPlayerPosition;
                            loopSwitch = false;
                        }
                    } else {
                        $(playerPosition).attr('id', this.playerId);
                        $(playerPosition).addClass('player');
                        $(playerPosition).append('<img src="css/images/' + this.playerId + '.png">');
                        this.playerPosition = randomPlayerPosition;
                        this.playerWeapon.weaponPosition = randomPlayerPosition;
                        loopSwitch = false;
                    }
                }
            } while (loopSwitch != false)//Tant que l'interrupteur n'est pas fermé
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
            let player2position = player2.playerPosition;
            let playersDistance = Math.abs(player1position - player2position);
            if (playersDistance == 1 || playersDistance == 10) {
                $('#gameboard').css('border', 'red 2px solid');
                $('#gameInterface').css('border', 'red 2px solid');
                updateInterface('#combatMode', 'Le combat est engagé !', 'text');
                switchMusic('combatMusic');
                setCombatInterface(currentPlayer, otherPlayer);
            } else {
                if (this.playerId == 'Player1') {
                    game(player2);
                } else {
                    game(player1);
                }
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
                playSound(newWeapon.weaponType + 'Get');
                $('#' + newWeapon.weaponId + ' img').remove();
                this.playerOldWeapon = this.playerWeapon.weaponId;
                this.playerWeapon = newWeapon;
                updateInterface('#' + this.playerId + 'Weapon', newWeapon.weaponName, 'text');
                updateInterface('#' + this.playerId + 'WeaponAttack', newWeapon.weaponAttack, 'text');
                $('#' + this.playerId + 'WeaponImgSpan img').remove();
                updateInterface('#' + this.playerId + 'WeaponImgSpan', '<img class="InterfaceWeaponImg" src="css/images/' + this.playerWeapon.weaponId + '.png">', 'append')
            }
        }
        attack() { //ATTAQUE CONTRE LE JOUEUR ADVERSE
            let damages = this.playerWeapon.weaponAttack; //Par défaut les dégats sont ceux de l'arme équipée
            let currentPlayer;
            let otherPlayer;
            if (this.playerId == 'Player1') { //On définit le joueur actuel, on en déduit le joueur adverse
                currentPlayer = player1;
                otherPlayer = player2;
            } else {
                currentPlayer = player2;
                otherPlayer = player1;
            }
            console.log(currentPlayer.weapon);
            if (otherPlayer.playerGuard) { //On vérifie si le joueur adverse s'est défendu au tour précédent
                damages = (currentPlayer.playerWeapon.weaponAttack / 2);
                otherPlayer.playerGuard = false;
            }
            playSound(currentPlayer.playerWeapon.weaponType + 'Hit');
            otherPlayer.playerLife -= damages; //On rédéfinie la santé du joueur adverse selon les dégâts subis
            updateInterface('#' + otherPlayer.playerId + 'Life', otherPlayer.playerLife, 'text');
            $('#playerStatus' + otherPlayer.playerId).effect("highlight", { color: 'red' }, 500, function () { }).dequeue().effect("shake", { times: 2 }, 500, function () {
                setTimeout(function () {
                    if (otherPlayer.playerLife <= 0) {
                        switchMusic('deathMusic');
                        setTimeout(function () {
                            looseGame(otherPlayer.playerId, otherPlayer.playerName, currentPlayer.playerName);
                        }, 1000)
                    } else {
                        setCombatInterface(currentPlayer, otherPlayer);
                    }
                }, 200)
            });
        }
        defend() { //DÉFENSE POUR LE PROCHAIN TOUR
            if (this.playerId == 'Player1') {
                this.playerGuard = true;
                setCombatInterface(player1, player2);
            } else {
                this.playerGuard = true;
                setCombatInterface(player2, player1);
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
                let randomWeaponPosition = Math.floor(Math.random() * (gbCasesAmount - 1)) + 1;
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
    const player1 = new Player("Player1", null, 100, weapon1, null);
    const player2 = new Player("Player2", null, 100, weapon2, null);
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
    function setCombatInterface(currentPlayer, ennemyPlayer) {//INTERFACE EN MODE COMBAT
        $('#combatStatus' + ennemyPlayer.playerId).fadeIn();
        $('#playerStatus' + ennemyPlayer.playerId).css('border', '#20acff solid 2px');
        updateInterface('#playerTurnName', "C'est à " + ennemyPlayer.playerName + ' de jouer !', 'text');
        $('#combatStatus' + currentPlayer.playerId).fadeOut();
        $('#playerStatus' + currentPlayer.playerId).css('border', 'none');
    }
    //INTERFACE LORS DE LA DEFAITE D'UN JOUEUR
    function looseGame(looserId, looserName, winnerName) {
        alert('Le jeu est terminé ! ' + looserName + ' a perdu !');
        $('.combatStatus').css('display', 'none');
        updateInterface('#combatMode', winnerName + ' est vainqueur !', 'text');
        updateInterface('#playerTurnName', looserName + ' a perdu !', 'text');
        updateInterface('#' + looserId + 'Life', 'Vaincu', 'text');
        $('#' + looserId + ' img').remove();
        updateInterface($('#' + looserId), '<img src="css/images/' + looserId + 'dead.png">', 'append');
        $('#interface' + looserId + ' img').remove();
        updateInterface($('#interface' + looserId), '<img src="css/images/' + looserId + 'dead.png">', 'append');
        $('#restartGame').fadeIn();
    }
    function playSound(target) {//GESTION DE L'AUDIO (LECTURE MUSIQUE ET SONS)
        if (sound) { $('#' + target).get(0).play(); }
    }
    function pauseMusic(target) {
        if (sound) { $('#' + target).get(0).pause(); }
    }
    function switchMusic(newMusic) {
        if (sound && music) {
            pauseMusic(currentMusic);
            currentMusic = newMusic;
            playSound(currentMusic);
        }
    }
    $('#player1AttackButton').click(function () {//GESTION DES BOUTONS LORS DU COMBAT
        player1.attack();
    });
    $('#player1DefendButton').click(function () {
        player1.defend();
    });
    $('#player2AttackButton').click(function () {
        player2.attack();
    });
    $('#player2DefendButton').click(function () {
        player2.defend();
    });
    $('.audioToggle').click(function () {//GESTION DU BOUTON POUR ALLUMER / ETEINDRE LE SON DANS LE JEU
        sound = true;
        if (sound && !music) {
            playSound(currentMusic);
            music = true;
        } else {
            pauseMusic(currentMusic);
            sound = false;
            music = false;
        }
    })
    $('#restartGame').click(function () {
        location.reload();
    });
    async function initializeGameboard() {//INITIALISATION DU JEU (MISE EN PLACE DU PLATEAU) PARTIE-1
        await gameBoard.setGameboard();//On attend que la mise en place du plateau soit finie pour continuer...
        gameboardCases = $('#gameboard div').toArray();
        intializeGame();
    }
    async function intializeGame() {//INITIALISATION DU JEU (MISE EN PLACE DU PLATEAU) PARTIE-2
        await gameBoard.setWalls();//On attend que la mise en place des murs soit finie pour continuer...
        $.each(weapons, function () {
            this.setInitialWeaponPosition();//Placement des armes sur le plateau de jeu
        })
        $.each(players, function (index, value) {
            value.setInitialPlayerPosition(); //Placement de chaque joueur sur le plateau de jeu
        })
        setInterface(); //INITIALISATION DE L'INTERFACE
        game(player2); //LANCEMENT DU TOUR DU JOUEUR 1
        switchMusic('mainMusic');
    }
    //ECRAN PRINCIPAL AVANT LE JEU, ON RECUPERE LE NOM DE CHAQUE JOUEUR
    function setWelcomeGame() {
        currentMusic = 'introMusic';
        $('#gameboard').css('border', '#20acff 0px solid');
        $('#welcome-player1').fadeIn();
        $('#player1NameCheck').click(function () {
            if ($('#player1NameInput').val() == '') {
                alert("Merci de renseigner un nom !");
            } else {
                player1.playerName = $('#player1NameInput').val();
                $('#welcome-player1').fadeOut();
                $('#welcome-player2').fadeIn();
            }
        });
        $('#player2NameCheck').click(function () {
            if ($('#player2NameInput').val() == '') {
                alert("Merci de renseigner un nom !");
            } else {
                player2.playerName = $('#player2NameInput').val();
                initializeGameboard();
                $('#gameInterface').fadeIn();
                $('.playersWeaponAttack').fadeIn();
                $('#gameboard').css('border', '#20acff 2px solid');
                $('#welcome-screen').fadeOut();
            }
        });
    }
    setWelcomeGame(); //LANCEMENT PRINCIPAL DU JEU
});