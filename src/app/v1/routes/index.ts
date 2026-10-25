import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { SubmissionRoutes } from "../modules/submission/submission.route";
import { AuditLogRoutes } from "../modules/auditLog/auditLog.route";

const v1Routes: Router = Router();

interface IRoutes {
  path: string;
  router: Router;
}

const routes: IRoutes[] = [
  { path: "/auth", router: AuthRoutes },
  { path: "/users", router: UserRoutes },
  { path: "/submissions", router: SubmissionRoutes },
  { path: "/audit-logs", router: AuditLogRoutes },
];

routes.forEach((route) => {
  v1Routes.use(route.path, route.router);
});

export default v1Routes;
