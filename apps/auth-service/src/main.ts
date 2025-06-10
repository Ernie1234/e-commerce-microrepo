import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swagerUI from 'swagger-ui-express';
import swaggerDocument from './utils/docs/swagger-output.json';

import router from './routes/auth-router';
import { errorMiddleware } from '@packages/error-handler/error-middleware';

dotenv.config();
// const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-type'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swagerUI.serve, swagerUI.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

app.get('/', (req, res) => {
  res.send({ message: 'Welcome auth API' });
});

app.use('/api/v1', router);

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`👱 Auth service is running at http://localhost:${port}/auth`);
  console.log(`📝 Swagger Docs available at http://localhost:${port}/docs`);
});

server.on('error', (err) => {
  console.log('Server Error: ', err);
});
