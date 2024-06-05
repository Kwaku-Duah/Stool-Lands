import { Router } from 'express';
import { assignInspector,inspectorAssign } from '../controllers/assignmentController';
import { authMiddleware, roleMiddleware, inspectorMiddleware } from '../middleWares/authMiddleware';



const assignRoutes: Router = Router();
assignRoutes.post('/assign',[authMiddleware,roleMiddleware],assignInspector)
assignRoutes.get('/all',[authMiddleware,inspectorMiddleware],inspectorAssign)

export default assignRoutes;
