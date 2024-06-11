import express from "express";
import { PORT } from './secrets';
import rootRouter from './routes';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from "body-parser";

import swaggerDoc from './utils/swaggerDoc';
import { seedScript } from '../prisma/seedScript';
import { seedPayableServices } from '../prisma/service';
import { existsSync, writeFileSync } from 'fs';

const app = express();
app.use(helmet());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
  })
);

app.use('/', rootRouter);
app.get('/hello', (req, res) => {
  res.send('Hello to the pakyi lands, you are through, THIS MUST WORK');
});


app.use('/', rootRouter);
app.get('/hi', (req, res) => {
  res.send('Blessings follow my yard');
});



swaggerDoc(app);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const seedFlagFile = '.seeded';
if (!existsSync(seedFlagFile)) {
  seedScript();
  seedPayableServices();
  writeFileSync(seedFlagFile, '');
}
