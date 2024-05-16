import { Redirect } from 'ice';

const AuthRoute = (Component) => {
  return (props) => {
    const token = localStorage.getItem('zjh_token');

    if (token) {
      return <Component {...props} />;
    }
    return <Redirect to="/login" />;
  };
};

export default AuthRoute;
