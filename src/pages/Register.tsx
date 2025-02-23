import React from 'react';
import { Card, Form, Input, Button } from 'antd';
import TelegramLoginButton from '../components/TelegramLoginButton';

const Register = () => {
  return (
    <Card>
      <Form>
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
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>

        <Form.Item>
          <TelegramLoginButton 
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_API_URL}/auth/telegram`;
            }}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Register;