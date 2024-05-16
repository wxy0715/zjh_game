import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest, useHistory } from 'ice';

import { Form, Input, Button, Modal, message } from 'antd';
import style from './index.module.less';
import store from '@/store';

interface IPayload {
  username: string;
  password: string;
  register?: boolean;
}

const Index = () => {
  const [modal, contextHolder] = Modal.useModal();
  const [, userDispatcher] = store.useModel('user');
  const history = useHistory();
  const { request: handleLogin } = useRequest((payload: IPayload) => ({
    url: '/api/login',
    data: payload,
    method: 'POST',
  }));

  const getConfig = (msg: string, values: IPayload) => {
    return {
      content: msg,
      async onOk() {
        const { token } = await handleLogin({ ...values, register: true });
        message.success('创建成功');
        localStorage.setItem('zjh_token', token);
        userDispatcher.getUserInfo();
        history.push('/');
        return Promise.resolve();
      },
    };
  };

  const onFinish = async (values: any) => {
    const { code, msg, token } = await handleLogin(values);
    if (code === 3001) {
      modal.confirm(getConfig(msg, values));
    } else {
      localStorage.setItem('zjh_token', token);
      userDispatcher.getUserInfo();
      history.push('/');
    }
  };

  return (
    <div className={style.loginWrapper}>
      <div className={style.formWrapper}>
        <h1 className={style.title}>
          <img
            src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
            alt=""
            width="40"
            height="40"
          />
          炸金花
        </h1>
        <h3 className={style.subTitle}>简易版炸金花</h3>
        <Form name="basic" onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登陆/注册
            </Button>
          </Form.Item>
        </Form>
      </div>
      {contextHolder}
    </div>
  );
};

export default Index;
