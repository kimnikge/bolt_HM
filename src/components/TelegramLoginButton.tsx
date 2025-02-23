import React from 'react';
import { Button } from 'antd';
import { TelegramOutlined } from '@ant-design/icons';

interface TelegramLoginButtonProps {
  onClick?: () => void;
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({ onClick }) => {
  return (
    <Button
      icon={<TelegramOutlined />}
      size="large"
      style={{ width: '100%', marginTop: '10px' }}
      onClick={onClick}
    >
      Войти через Telegram
    </Button>
  );
};

export default TelegramLoginButton;
