import React from 'react';
import { Card, Form, Input, Button } from 'antd';
import TelegramLoginButton from '../components/TelegramLoginButton';

const Login = () => {
  const handleSubmit = (values) => {
    console.log('Received values of form: ', values);
  };

  return (
    <Card title="Login">
      <Form onFinish={handleSubmit}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input type="password" placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Log in
          </Button>
        </Form.Item>
        <TelegramLoginButton 
          onClick={() => {
            window.location.href = `${process.env.REACT_APP_API_URL}/auth/telegram`;
          }}
        />
      </Form>
    </Card>
  );
};

export default Login;
