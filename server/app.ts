import * as express from 'express';
import * as bodyParser from 'body-parser';

const app = express();

app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

export default app;
