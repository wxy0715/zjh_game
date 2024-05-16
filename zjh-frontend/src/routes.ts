import { IRouterConfig, lazy } from 'ice';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Room = lazy(() => import('@/pages/Room'));
const NotFound = lazy(() => import('@/components/NotFound'));

const routerConfig: IRouterConfig[] = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/room',
    exact: true,
    component: Room,
  },
  {
    path: '/',
    exact: true,
    component: Home,
  },
  {
    component: NotFound,
  },
];

export default routerConfig;
