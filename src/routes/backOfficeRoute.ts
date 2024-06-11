import express from 'express';
import { Router } from 'express'
import { createSecretary } from '../controllers/secretaryController';
import { createInspector,inspectProof } from '../controllers/inspectorController';
import { createChief } from '../controllers/chiefController';
import { adminMiddleware, authMiddleware,inspectorMiddleware, roleMiddleware } from '../middleWares/authMiddleware';
import upload from '../middleWares/uploadMulter'

const backRoute: Router = express.Router()
backRoute.post('/secretary',[authMiddleware,adminMiddleware],createSecretary)

backRoute.post('/proof',[authMiddleware,inspectorMiddleware],upload.any(),inspectProof)
backRoute.post('/inspector',[authMiddleware,roleMiddleware],createInspector)
backRoute.post('/chief',[authMiddleware,adminMiddleware],createChief)

export default backRoute;