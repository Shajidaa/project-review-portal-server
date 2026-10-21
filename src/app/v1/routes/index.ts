import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";

const v1Routes: Router = Router();

interface IRoutes {
  path: string;
  router: Router;
}

const routes: IRoutes[] = [{ path: "/auth", router: AuthRoutes }];

routes.forEach((route) => {
  v1Routes.use(route.path, route.router);
});

export default v1Routes;
