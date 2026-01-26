import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const GlobalStats: React.FC = () => {
  return (
    <Card 
      hoverable
      bordered
      className="min-h-[200px]"
    >
      <Title level={3}>Global Stats</Title>
      <Text type="secondary">Estadísticas globales del partido</Text>
    </Card>
  );
};

export default GlobalStats;
