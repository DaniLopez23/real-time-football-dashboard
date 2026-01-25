import React from 'react';
import { Layout, Typography, Image } from 'antd';

const { Header } = Layout;
const { Title, Text } = Typography;

const DashboardHeader: React.FC = () => {
  return (
    <Header 
      style={{ 
        backgroundColor: '#0f172a',
        borderBottom: '4px solid #1e3a8a',
        height: 'auto'
      }}
      className="px-6 py-4"
    >
      <div>
        <Image
          src="/app_logo.png"
          alt="LiveBall Logo"
          width={48}
          height={48}
          style={{ marginBottom: '8px' }}
        />

        <Title 
          level={1} 
          style={{ color: '#fff', fontSize: '2.25rem', marginBottom: '4px' }}
        >
          LiveBall <span style={{ color: '#10b981' }}>(LIBA)</span>
        </Title>
        <Text style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          Real-Time Football Dashboard
        </Text>
      </div>
    </Header>
  );
};

export default DashboardHeader;
