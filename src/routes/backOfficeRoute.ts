import express from 'express';
import { Router } from 'express'
import { createSecretary } from '../controllers/secretaryController';
import { createInspector } from '../controllers/inspectorController';
import { createChief } from '../controllers/chiefController';
import { adminMiddleware, authMiddleware, secretaryMiddleware } from '../middleWares/authMiddleware';

const backRoute: Router = express.Router()
backRoute.post('/secretary',[authMiddleware,adminMiddleware],createSecretary)
backRoute.post('/inspector',[authMiddleware,adminMiddleware],createInspector)
backRoute.post('/chief',[authMiddleware,adminMiddleware],createChief)

export default backRoute;