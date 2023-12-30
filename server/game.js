class Player {
    bet = {};
    constructor(username, socketId) {
      this.username = username;
      this.socketId = socketId;
    }

    resetBet(){
        this.bet = {};
    }
}

const positions = {First: "1st", Second: "2nd", Third: "3rd", Fourth: "4th"}

class Game {

    cardValues = ["2","3","4","5","6","7","8","9","10","jack","queen","king"];
    suits = ["hearts", "diamonds", "spades", "clubs"]
    deck = [];
    crampCards = [];
    grid =[
        ['','','','',''],
        ['','','','','back_of_card'],
        ['','','','','back_of_card'],
        ['','','','','back_of_card'],
        ['clubs_ace','diamonds_ace','hearts_ace','spades_ace','back_of_card']
    ]
    initDone = false;
    gameWon = false;
    winner = null;
    sockets = {};
    positions = {clubs_ace: positions.Fourth, diamonds_ace: positions.Fourth, hearts_ace: positions.Fourth, spades_ace: positions.Fourth}
    constructor(gameId){
        this.gameId = gameId;
        this.players = [];
        this.initDeck();
    }

    initDeck(){
        this.deck = [];
        this.suits.forEach((suit)=>{
            this.cardValues.forEach((cardValue)=>{
                this.deck.push(`${suit}_${cardValue}`);
            })
        })
        this.crampCards = []
        for(let i = 0; i < 4; i++){
            this.crampCards.push(this.flipCard());
        }
        this.initDone = true;
    }


    findPositionOfAce(card){
        let currentRow = null;
        let currentRowIndex = null;
        let columnIndex = null;
        const suit = card.split("_")[0];
        const ace = suit + "_ace";
        switch(suit){
            case "clubs":
                columnIndex = 0;
                break;
            case "diamonds":
                columnIndex = 1;
                break;
            case "hearts":
                columnIndex =2;
                break;
            case "spades":
                columnIndex = 3;
                break;
        }
        this.grid.forEach((row, index)=>{
            if (row.indexOf(ace) !== -1){
                currentRow = row;
                currentRowIndex = index;
            }
        })

        return [currentRow, currentRowIndex, columnIndex, ace]
    }


    moveAce(card){
        let currentRow = null;
        let currentRowIndex = null;
        let columnIndex = null;
        let ace = null;
        [currentRow, currentRowIndex, columnIndex, ace] = this.findPositionOfAce(card);
        const newGrid = [...this.grid];
        if(currentRowIndex > 0 ){
            newGrid[currentRowIndex-1][columnIndex] = ace;
            newGrid[currentRowIndex][columnIndex] = '';
        } 
        if (currentRowIndex === 1){
            this.gameWon = true;
            this.winner = ace;
        }
  
        if(!this.checkIfHorseBelow(currentRowIndex, newGrid) && newGrid[currentRowIndex][4] === 'back_of_card'){
            newGrid[currentRowIndex][4] = this.crampCards[currentRowIndex-1];
            [currentRow, currentRowIndex, columnIndex, ace] = this.findPositionOfAce(this.crampCards[currentRowIndex-1]);
            newGrid[currentRowIndex+1][columnIndex] = ace;
            newGrid[currentRowIndex][columnIndex] = '';
        }
        this.grid = newGrid;

        this.updatePositions();

    }

    checkIfHorseBelow(rowIndex, grid){
        for (let i = rowIndex; i <= 4; i++){
            for (let j=0; j <= 3; j++){
                if(grid[i][j] !== ''){
                    return true;
                }
            }
        }
        return false;
    }

    updatePositions() {
        let count = 0;
        for (let rowIndex = 0; rowIndex <= 4; rowIndex++){
            for (let columnIndex = 0; columnIndex <= 3; columnIndex++){
                if (this.grid[rowIndex][columnIndex] !== ''){
                    count +=1;
                    this.positions[this.grid[rowIndex][columnIndex]] = positions.Fourth;
                    switch(count){
                        case 1:
                            this.positions[this.grid[rowIndex][columnIndex]] = positions.First;
                            break;
                        case 2:
                            this.positions[this.grid[rowIndex][columnIndex]] = positions.Second;
                            break;
                        case 3:
                            this.positions[this.grid[rowIndex][columnIndex]] = positions.Third;
                            break;
                        case 4:
                            this.positions[this.grid[rowIndex][columnIndex]] = positions.Fourth;
                            break;
                    }
                }
            }
        }
    
    }
    


    addPlayer(username, socketId) {
        const newPlayer = new Player(username, socketId);
        this.players.push(newPlayer);
        this.sockets[socketId] = newPlayer;
    }
    
    removePlayer(socketId) {
        const removedPlayer = this.sockets[socketId];
        if (removedPlayer) {
          delete this.sockets[socketId];
          this.players = this.players.filter(player => player.socketId !== socketId);
        }
        return removedPlayer;
    }

    flipCard(){
        const cardIndex = Math.floor(Math.random() * this.deck.length);
        const card = this.deck[cardIndex];
        this.deck.splice(cardIndex,1);
        
        if(this.initDone){ 
            this.moveAce(card);
        }

        return card;
    }

}

module.exports = Game;