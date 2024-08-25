const cluster = require('cluster');
const os = require('os');
const clusterService = (worker, cpu) => {
	const cpuAll = cpu || os.cpus().length;
	if (cluster?.isMaster) {
		console.log(`Мастер процесс запущен PID: ${process.pid}`);
		for (let i = 0; i < cpuAll; i++) cluster?.fork();
		cluster?.on('exit', (worker, code, signal) => {
			console.log(`Воркер ${worker.process.pid} отключен. Повторный запуск воркера...`, code, signal);
			console.log(code, signal);
			cluster?.fork();
		});
	} else {
		worker();
		console.log(`Воркер PID: ${process.pid} запущен`);
	}
}

module.exports = clusterService;