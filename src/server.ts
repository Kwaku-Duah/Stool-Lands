import express from "express";
import { PORT } from './secrets';
import rootRouter from './routes';
import cors from 'cors';
import helmet from 'helmet';
import swaggerDoc from './utils/swaggerDoc';
import { seedScript } from '../prisma/seedScript';
import { existsSync, writeFileSync } from 'fs';

const app = express();
app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
  })
);

app.use('/', rootRouter);
swaggerDoc(app);


const seedFlagFile = '.seeded';
if (!existsSync(seedFlagFile)) {
  seedScript();
  writeFileSync(seedFlagFile, '');
}
app.listen(PORT, () => {});