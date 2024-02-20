/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type { TCallbackResponse, TUser } from './utils/types';

let connections = 0;
const users: TUser = {};

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

io.on('connection', (socket) =>
{
	socket.data.logon = false;

	socket.on('add user', function (username: string, callback: (response: TCallbackResponse) => void)
	{
		if (username.length === 0 || username.trim().length === 0)
		{
			callback({ error: true, message: 'Username is missing' });
			return;
		}

		if (users[username])
		{
			callback({ error: true, message: 'User is already connected' });
			return;
		}
		users[username] = username;
		socket.data.username = username;
		socket.data.logon = true;
		connections++;
		// Mostrar en el chat a todos quien se unió y actualizar la cantidad de usuarios
		socket.broadcast.emit('user connected', {
			username,
			connections,
		});
		callback({ online: connections, users: Object.keys(users) });
	});

	socket.on('chat message', function (message: string)
	{
		// Envia a todos los sockets que alguien envió un mensaje
		if (message.trim().length === 0) return;
		socket.broadcast.emit('chat message', `${socket.data.username}: ${message}`);
		socket.emit('chat message', `${socket.data.username}: ${message}`);
	});

	socket.on('disconnect', () =>
	{
		if (socket.data.logon)
		{
			delete users[socket.data.username];
			connections--;
			socket.data.logon = false;
			// Mostrar en el chat a todos quien se fue y actualizar la cantidad de usuarios
			socket.broadcast.emit('user disconnected', {
				username: socket.data.username,
				connections,
			});
		}
	});
});

server.listen(process.env.PORT || 3000, () =>
{
	console.log(`server running in localhost:${process.env.PORT || 3000}`);
});
