import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const TeamStats: React.FC = () => {
  return (
    <Card 
      hoverable
      variant="outlined"
      className="min-h-[200px]"
    >
      <Title level={3}>Team Stats</Title>
      <Text type="secondary">Estadísticas concretas de cada equipo</Text>
    </Card>
  );
};

export default TeamStats;
