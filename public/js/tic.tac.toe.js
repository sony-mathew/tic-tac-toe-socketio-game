
/*-------------------------------------------------------------------------------------------------------
Global Variables
--------------------------------------------------------------------------------------------------------*/
var Me = 0,
	MyId = 0,
	socket = io('http://localhost'),
	playerDisable = true,
	otherPlayersMove = false;

var serverVariables = {
	gameId		: ''
};

var Game = {
	PlayerOne 		: null,
	PlayerTwo 		: null,
	CurrentPlayer 	: null,
	Board 			: [0, 0, 0, 0, 0, 0, 0, 0, 0],
	Chances 		: 0,
	Winner			: null,
	WinningCase 	: 0
};


/*-------------------------------------------------------------------------------------------------------
Socket Events
--------------------------------------------------------------------------------------------------------*/

//testing on connection
socket.on('news', function (data) {
			    socket.emit('my other event', { my: 'data' });
			    console.log(data['hello']);
			    // console.log("socketid:"+socket.io.engine.id);
			    MyId = socket.io.engine.id ;
			  });


//server acknowledgement of creation of a new game 
socket.on('CreateGameAcknowledge', function(data) {
				createGameSuccess(data);
				console.log('Game created : ' + data);
			});


//server acknowledgement for joining a game
socket.on('JoinGameAcknowledge', function(data){
				console.log(data[1]);
				if( data[0]) {
					startGame(data[2], 'You');
				}
				else {
					enableJoinGame(data[1]);
				}
			});


//server acknowledgement on new user connected to your game
socket.on('newUserJoined', function(data) {
				console.log('Start playing dude. User Joined.');
				startGame( 'You', data['secondPlayer']);
			});


//playing game 
socket.on('playGame', function(data) {
				console.log('Other players move recieved.');
				otherPlayersMove = true;
				play(data);
				console.log("other players move implemented.")
				//implementOtherPlayersMove(data);
			});


//Notify if the other player left the game
socket.on('PlayerLeft', function(data) {
				console.log(data + " ::: Other player left dude.");
				loadPreloader();
			});

//Restarting the game
socket.on('RestartGame', function(data) {
				console.log(data+ " ::: The other guy restarted.");
				gameinit();
			});

/*-------------------------------------------------------------------------------------------------------
Preloader form events and functions
--------------------------------------------------------------------------------------------------------*/

//preloader form listners
initialListners();

function initialListners() {

	//listner for username submit button
	var userNameButton = getId("name-submit", 1);
	userNameButton.addEventListener('click', getUserName, false);

	//listner for create game and join-game button
	getId("create-game", 1).addEventListener('click', createGame, false);
	getId("join-game", 1).addEventListener('click', joinGame, false);
	//getId("join-random-game", 1).addEventListener('click', joinRandomGame, false);

}

function getUserName(evt) {

	//	alert("cool");
	//removing event listner
	evt.target.removeEventListener( 'click', getUserName, false);

	//hiding the name-submit button
	getId("name-submit", 1).style.display = "none";

	Me = getId("name", 1).value;
	getId("name", 1).setAttribute("disabled", "true");
	getId("name", 1).style.width = "94%";
	console.log(Me);
	//unhiding create and join game buttons
	getId("create-game", 1).style.display = "inline-block";
	getId("join-game", 1).style.display = "inline-block";
}


function createGame( evt) {
    
    //removing listner for create game
	evt.target.removeEventListener('click', createGame, false)
	socket.emit('CreateGame', { 'clientName': Me});
	console.log("createGame");
}

function createGameSuccess( data ) {
	
	serverVariables.gameId = data['gameId'];
	Game.PlayerOne = Me;

	helperOfcreateGameSuccess();

	//making him/her the first player
	playerDisable = false;

	console.log("createGameSuccess : " + data['gameId']);
}


function helperOfcreateGameSuccess() {
	//hiding the join game and create game
	getId("create-game", 1).style.display = "none";
	getId("join-game", 1).style.display = "none";

	//displaying the game id to the user and showing please wait
	getId("game-id-box", 1).style.display = "inline-block";
	getId("game-id-box", 1).style.width = "94%";
	getId("game-id-box", 1).value = "Game ID : "+serverVariables.gameId;
	getId("game-id-box", 1).setAttribute("disabled", "true");

	//displaying preloader img and text
	getId("loader", 1).style.display = "block";
	displayMsg( {"loader-text" : "Waiting for users to connect . ."});
	getId("loader-text", 1).style.display = "block";
	getId("init", 1).style.marginTop = "-200px" ;
}


function joinGame( evt) {
	var userInputGameId = getId("game-id-box", 1).value;
	if( userInputGameId.length == 5){
		//sent the game ID to server
		evt.target.removeEventListener('click', joinGame, false);
		console.log('Sending Game ID to to server');
		socket.emit('JoinGame' , { 'clientName' : Me, 'gameId' : userInputGameId});
		return 0;
	} else {
		if( getId("game-id-box", 1).style.display == "inline-block") {
			getId("game-id-box", 1).value = "";
			getId("game-id-box", 1).setAttribute("placeholder", "Invalid Game ID");
		}
	}

	getId("create-game", 1).style.display = "none";
	//getId("join-random-game", 1).style.display = "block";
	getId("game-id-box", 1).style.display = "inline-block";
	console.log("joinGame Show box");
}


function enableJoinGame( msg){
	//adding event listner to join game
	getId("join-game", 1).addEventListener('click', joinGame, false);
	getId("loader-text", 1).style.display = "block";
	getId("loader-text", 1).style.marginTop = "50px";
	getId("init", 1).style.marginLeft = "-350px";
	getId("loader-text", 1).innerHTML = msg;
}


function startGame( player1, player2) {

	Game.PlayerOne = player1;
	Game.PlayerTwo = player2;
	Game.CurrentPlayer = 1;
	
	gameinit();

	//hide the preloader things
	getId("init", 1).style.display = "none";
	getId("arena", 1).style.display = "inline-block";
}

function loadPreloader() {
	//hide the arena and unhide preloader
	getId("init", 1).style.display = "inline-block";
	getId("arena", 1).style.display = "none";

	//listner for create game and join-game button
	getId("create-game", 1).addEventListener('click', createGame, false);
	getId("join-game", 1).addEventListener('click', joinGame, false);


	//hide the rest of items below it
	getId("create-game", 1).style.display = "inline-block";
	getId("join-game", 1).style.display = "inline-block";

	getId("game-id-box", 1).style.display = "none";
	getId("game-id-box", 1).value = "";
	getId("game-id-box", 1).removeAttribute("disabled");
	getId("game-id-box", 1).style.width = "auto";

	getId("loader", 1).style.display = "none";	
	getId("loader-text", 1).style.marginTop = "50px";
	displayMsg( {"loader-text" : "The other player left the game."});


	console.log("Final : The pre loader function complete.");
}


/*-------------------------------------------------------------------------------------------------------
All functions related to game and game play
--------------------------------------------------------------------------------------------------------*/

function gameinit() {

	addGameListeners();

	//checking if no names are given
	Game.PlayerOne = Game.PlayerOne == null ? 'Nut' : Game.PlayerOne ;
	Game.PlayerTwo = Game.PlayerTwo == null ? 'Bolt' : Game.PlayerTwo ;

	//clear the BOARD
	for (var i = 0; i < 9; i++) {
		Game.Board[i] = 0;
	};

	//resetting current player and chances
	Game.CurrentPlayer = 1 ;
	Game.Chances = 0;

	//display players names and welcome message in the stats area
	displayMsg ( { "user_1" : Game.PlayerOne, 
				   "user_2" : Game.PlayerTwo,
				   "msg" 	: "Welcome to new game of Tic-Tac-Toe. " + Game.PlayerOne + " can start the game. "});

	//focus on player one
	playerFocus(1);

	//clear the arena
	clearArena();
}

function addGameListeners() {

	//Listener for restart button
	var restartButton = getId("restart", 1);
	restartButton.addEventListener('click', function() { 
		gameinit(1); 
		socket.emit("RestartGame", "Restart the game.");
		console.log("Restart Command send.");
	}, false);

	//Listener for the board
	var td = document.querySelectorAll("td");
	for( var i = 0; i < td.length ; ++i ){
		td[i]. addEventListener('click', play, false);
	}

}

/*funtion to select an element by id or name 
if flag = 0 , select id, or select by name */
function getId( name , flag ) {

		return (flag ? document.getElementById(name) : document.getElementsByName(name)[0].value );
	}


function editClass(object, flag) {

	for (var id in object) {
		if( flag ) {
			document.getElementById(id).classList.add(object[id]);
		} else {
			document.getElementById(id).classList.remove(object[id]);
		}	
	}
}

function displayMsg(msg) {

	for (var id in msg) {
		document.getElementById(id).innerHTML = msg[id]; 	
	}	
}

function playerFocus( user )  {

	//remove the focus from both the players
	if( user == 3) {
		editClass( { "user_2" : "active-user-2" , "user_1" : "active-user-1"} , 1);
		editClass( { "user_2" : "active-user" , "user_1" : "active-user"}, 0); 
		return 0;
	}	

	//add focus to one player
	var user_rem = (user == 1 ? 2 : 1);

	//adding the neccessary classes
	var addClasses = {}; 
	addClasses["user_"+user] = "active-user";
	addClasses["user_"+user_rem] = "active-user-"+user_rem;
	editClass( addClasses , 1);

	//removing the neccesary classes
	var removeClasses = {}; 
	removeClasses["user_"+user_rem] = "active-user";
	removeClasses["user_"+user] = "active-user-"+user;
	editClass( removeClasses , 0);

}


function clearArena() {

	//clear all the cells 
	for (var i = 1; i < 10; i++) {
		var cellId = "c"+i; 
		getId(cellId, 1).removeAttribute('class');
		getId(cellId, 1).innerHTML = "&nbsp;&nbsp;&nbsp;";
		var cell = {};
		cell[ "c" +i] = 'active';
		editClass( cell, 1);
	};
}



function play(evt) {

	if(playerDisable && !otherPlayersMove) {
		return 0;
	}
	
	if( otherPlayersMove) {
		var num = evt["cell"];
		// removing the listener of the fired element
		getId("c"+num, 1).removeEventListener('click', play, false);
	}
	else {
		// removing the listener of the fired element
		evt.target.removeEventListener('click', play, false);

		//getting the id of the fired element
		var id = event.target.id;
		//alert(id);
		var num = parseInt(id[1]);
	}
	

	//increment the chances
	++Game.Chances;

	//check if the cell is already clicked
	if( Game.Board[num-1] ) { return 0; }

	//change msg
	var user = Game.CurrentPlayer == 1 ? Game.PlayerTwo : Game.PlayerOne ;
	displayMsg( { "msg" : 'Fair play. <br/> Now it\'s ' + (user == 'You'? 'your' : user +'\'s') +' chance.' } );

	//change the board entry
	Game.Board[num-1] = Game.CurrentPlayer ;

	//if not game over, change the color and symbol of clicked cell
	var cls = {};
	var cell = "c"+num;
	
	cls[cell] = 'user-'+ Game.CurrentPlayer +'-cell' ;
	editClass( cls , 1);
	
	cls[cell] = 'active';
	editClass( cls , 0);

	var symbol   = Game.CurrentPlayer == 1 ? 'O' : 'X' ;
	cls[cell] = symbol;
	displayMsg(cls);

	//change the current player
	Game.CurrentPlayer = Game.CurrentPlayer == 1 ? 2 : 1 ;
	playerDisable = !playerDisable;

	//change the focus in username highlighting
	playerFocus(Game.CurrentPlayer);

	if( !otherPlayersMove) {
		//sending the data to other player
		socket.emit('PlayGame', { 
			cell   : num,
			gameId : serverVariables.gameId,
			board  : Game.Board 
		});

		console.log('Sending click to other player : ' + num);
	}
	
	otherPlayersMove = false;

	//checking whether the game is over
	if ( checkGameOver() ) {
		gameOverEvents();
		return 0;
	}

	//checking end of the game
	if( Game.Chances == 9 ) {
		playerFocus(3);
		displayMsg( { "msg" : "Game Over. <br/> Well played. It is a tie." });
	}
}

function checkGameOver() {
	// return 0;

	var flag = 0;
	var user_num = [1, 2];

	for (var i = 0; i < 2; i++) {

		for (var j = 0; j < 3; j++) {
			// var col = (j*3);
			//check row
			flag = ((Game.Board[j*3] == user_num[i]) && (Game.Board[(j*3)+1] == user_num[i]) && (Game.Board[(j*3)+2] == user_num[i])) ? i+1 : 0 ;
			if (flag) { 
				Game.WinningCase = j+1;
				break;
			};

			//checking column
			flag = ((Game.Board[j] == user_num[i]) && (Game.Board[j+3] == user_num[i]) && (Game.Board[j+6] == user_num[i])) ? i+1 : 0 ;
			if (flag) { 
				Game.WinningCase = j+4;
				break;
			};
		};

		if (flag) { break;};
		//check left diagonal
		flag = ((Game.Board[0] == user_num[i]) && (Game.Board[4] == user_num[i]) && (Game.Board[8] == user_num[i])) ? i+1 : 0 ;
		if (flag) { 
				Game.WinningCase = 7;
				break;
			};	
		//check right diagonal
		flag = ((Game.Board[2] == user_num[i]) && (Game.Board[4] == user_num[i]) && (Game.Board[6] == user_num[i])) ? i+1 : 0 ;
		if (flag) { 
				Game.WinningCase = 8;
				break;
			};

	};


	if (!flag) { return 0 ; };

	Game.Winner = flag;
	return 1;


}



function gameOverEvents() {

	//display the message
	displayMsg( { "msg" : "Game Over. <br/> " + (Game.Winner == 1 ? Game.PlayerOne : Game.PlayerTwo )+ ' won the game.' });

	//remove focus
	playerFocus(3);

	//changing background of the path
	changeBgWonCell();

	//deactivate all remaining cells
	var td = document.querySelectorAll("td");
	for( var i = 0; i < td.length ; ++i ){
		td[i]. removeEventListener('click', play, false);
		td[i].classList.remove('active');
	}

	//alert( (Game.Winner == 1 ? Game.PlayerOne : Game.PlayerTwo ) +' Won the Game. Congragulations..!!');
}



function winCaseToCellMapping() {

	var row = 0;
	if( Game.WinningCase < 4 ) {
		row = (Game.WinningCase - 1)*3;
		return [ row, row + 1, row + 2 ];
	}else if( Game.WinningCase < 7) {
		row = Game.WinningCase - 4 ;
		return [ row, row + 3, row + 6 ];
	}else if( Game.WinningCase == 7) {
		return [0, 4, 8];
	}else if( Game.WinningCase == 8 ) {
		return [2, 4, 6];
	}

}

function changeBgWonCell() {

	var cells = winCaseToCellMapping();
	//change backround of the winning players line of cells
	document.getElementById("c"+ ++cells[0]).classList.add('won-cell');
	document.getElementById("c"+ cells[0]).classList.remove('user-' + Game.Winner + '-cell');

	document.getElementById("c"+ ++cells[1]).classList.add('won-cell');
	document.getElementById("c"+ cells[1]).classList.remove('user-' + Game.Winner + '-cell');

	document.getElementById("c"+ ++cells[2]).classList.add('won-cell');
	document.getElementById("c"+ cells[2]).classList.remove('user-' + Game.Winner + '-cell');
}

