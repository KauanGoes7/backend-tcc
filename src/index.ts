import http from 'http';
import app from './app';

const server = http.createServer(app);

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
