import { Layout, Typography } from 'antd';
import DashboardHeader from './layout/DahsboardHeader';
import EventPitch from './Pitch/EventPitch';
import NetworkPassPitch from './Pitch/NetworkPassPitch';
import GlobalStats from './Stats/GlobalStats';
import TeamStats from './Stats/TeamStats';

const { Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <Content className="">
        <EventPitch />
      </Content>
    </Layout>
  )
}

export default App
