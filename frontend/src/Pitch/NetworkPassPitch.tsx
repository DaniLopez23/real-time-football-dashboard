import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const NetworkPassPitch: React.FC = () => {
  return (
    <Card 
      style={{ backgroundColor: '#f9fafb' }}
      className="min-h-[400px]"
    >
      <Title level={3}>Network Pass Pitch</Title>
      <Text type="secondary">Redes de pases</Text>
    </Card>
  );
};

export default NetworkPassPitch;
