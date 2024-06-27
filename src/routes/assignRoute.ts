import { Router } from 'express';
import { assignInspector,inspectorAssign } from '../controllers/assignmentController';
import { authMiddleware, roleMiddleware, inspectorMiddleware } from '../middleWares/authMiddleware';
import { allInspectors } from '../controllers/userController';



const assignRoutes: Router = Router();
assignRoutes.post('/assign',[authMiddleware,roleMiddleware],assignInspector)
assignRoutes.get('/all',[authMiddleware,inspectorMiddleware],inspectorAssign)
assignRoutes.get("/inspectors",allInspectors);

export default assignRoutes;
