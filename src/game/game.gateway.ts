import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// impliments OnGatewayConnection... check to see if they are in a game

const games: Games = {};

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  queue: Queue = {};

  @SubscribeMessage('search-server')
  handleSearch(
    @MessageBody() payload: number,
    @ConnectedSocket() client: Socket,
  ): any {
    console.log('searching...');
    console.log(payload);

    this.queue[payload] = null;
    client.join('waiting-room');

    // Filters out players that have already been assigned a game
    const playersWating = Object.keys(this.queue)
      .filter((key) => this.queue[parseInt(key)].gameId === null)
      .map((key) => parseInt(key));

    // If two or more players are available, make a new game for them
    if (playersWating.length > 1) {
      const gameId = Date.now().toString();
      const playerIds = playersWating.slice(0, 2);
      // Set gameId for each player
      playerIds.map((pid) => (this.queue[pid].gameId = gameId));
      // Create player array to generate Game instance
      const players = playerIds.map((pid) => this.queue[pid].player);
      games[gameId] = new Game(players);
    }
    this.server.to('waiting-room').emit('search-client', this.queue);
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @MessageBody() { gameId, player }: JoinGame,
    @ConnectedSocket() client: Socket,
  ) {
    delete this.queue[player.id];
    client.leave('waiting-room');
    client.join(gameId);
  }

  @SubscribeMessage('end-turn')
  handleEndTurn(@MessageBody() payload: PlayerTurn): void {
    console.log('end-turn');
    console.log(payload);
    games[payload.gameId].endTurn(payload);
  }

  @SubscribeMessage('start-turn')
  handleEndAnimations(@MessageBody() payload: boolean): any {
    console.log('start-turn');
    console.log(payload);
    // If both players have finished animations, call handleStartTurn

    return payload;
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('hanlding this connection!');
  }
}
