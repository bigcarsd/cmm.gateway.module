require('dotenv').config();
const clusterService = require("./cluster.service");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Импортируем cors
const { Connection } = require("rabbitmq-client");

const worker = () => {
	const app = express();
	
	app.use(cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешенные методы
		allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
	}));
	
	app.use(bodyParser.json());
	const rabbit = new Connection(process.env.POST_RABBITMQ_URL);
	const port = process.env.PORT || 30200;
	const rpcClient = rabbit.createRPCClient({ confirm: true });
	app.get('/test/fnc/1', async (req, res) => {
		console.log('/test/fnc', 'srp-function');
		const response = await rpcClient.send('srp-function', {method: 'fnc1'});
		res.json(response.body);
	});
	app.get('/test/fnc/2', async (req, res) => {
		console.log('/test/fnc/2', 'srp-function');
		const response = await rpcClient.send('srp-function', {method: 'fnc2'});
		res.json(response.body);
	});
	app.get('/test/fnc/3', async (req, res) => {
		console.log('/test/fnc/3', 'srp-function');
		const response = await rpcClient.send('srp-function', {method: 'fnc3'});
		res.json(response.body);
	});
	app.get('/test/fnc/4', async (req, res) => {
		console.log('/test/fnc/4', 'srp-function');
		const response = await rpcClient.send('srp-function', {method: 'fnc4'});
		res.json(response.body);
	});
	app.get('/test/class/1', async (req, res) => {
		console.log('/test/class');
		const response = await rpcClient.send('srp-class1', { method: 'class1'});
		res.json(response.body);
	});
	app.get('/test/class/2', async (req, res) => {
		console.log('/test/class');
		const response = await rpcClient.send('srp-class2', { method: 'class2'});
		res.json(response.body);
	});
	app.get('/test-get', async (req, res) => {
		console.log('test-get', req.query);
		res.json({ message: 'test-get', query: req.query, headers: req.headers });
		// res.json({ message: 'sss', query: req.query, headers: req.headers });
	
	});
	
	app.post('/test-post', async (req, res) => {
		console.log('test-post', req.body);
		res.json({ message: 'test-post', body: req.body, headers: req.headers });
	});
	
	app.post('/user/auth', async (req, res) => {
		try {
			console.log('\n============\n', 'body:', req.body, '\n============\n');
			const body = { method: 'auth', query: req.query, body: req.body, date: Date.now() };
			const response = await rpcClient.send('user-module-queue', body);
			res.json(response.body);
		} catch (error) {
			console.log('error:', error);
			res.status(500).json({ error: 'Error communicating with time worker' });
		}
	});
	
	app.post('/match/cmd', async (req, res) => {
		try {
			console.log('\n============\n', 'body:', req.body, '\n============\n');
			const body = { method: 'auth', query: req.query, body: req.body, date: Date.now() };
			const response = await rpcClient.send('match-module-queue', body);
			res.json(response.body);
		} catch (error) {
			console.log('error:', error);
			res.status(500).json({ error: 'Error communicating with time worker' });
		}
	});

	app.get('/time', async (req, res) => {
		try {
			const response = await rpcClient.send('my-rpc-queue', 'ping');
			res.json(response.body);
		} catch (error) {
			res.status(500).json({ error: 'Error communicating with time worker' });
		}
	});
	app.get('/telegram', async (req, res) => {
		try {
			const response = await rpcClient.send('rpc-telegram-queue', 'ping');
			res.json(response.body);
		} catch (error) {
			res.status(500).json({ error: 'Error communicating with time worker' });
		}
	});
	app.get('/telegram/send', async (req, res) => {
		try {
			const { chatId, message } = req.query;
			if (!chatId || !message) return res.json({ error: 'Invalid query' });
			const response = await rpcClient.send('tg-send-message-queue', { chatId, message });
			res.json(response.body);
		} catch (error) {
			res.status(500).json({ error: 'Error communicating with time worker' });
		}
	});
	app.post('/telegram/bot/message', async (req, res) => {
		try {
			res.status(200).send('OK');
			rpcClient.send('rpc-telegram-queue', req.body);
		} catch (error) {
			console.log('error:', error);
		}
	});
	app.post('/telegram/bot/message-old', async (req, res) => {
		console.log('body:', req.body);
		console.log('query:', req.query);
		console.log('params:', req.params);
		console.log('headers:', req.headers);
		res.status(200).send('OK');
		try {
			console.log('body:', req.body);
			const bodyString = JSON.stringify(req.body);
			console.log(bodyString, req.body);
			const response = await rpcClient.send('rpc-telegram-queue', bodyString);
			// res.json(response.body);
		} catch (error) {
			console.log('error:', error);
			// res.status(200).send('OK');
			
			// res.status(500).json({ error: 'Error communicating with time worker' });
		}
	});
	
	app.listen(port, () => console.log(`Worker ${process.pid} listening at http://localhost:${port}`));
}

clusterService(worker);