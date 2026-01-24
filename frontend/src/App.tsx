import { Card, Col, Layout, Row, Space, Typography } from 'antd'

const { Header, Content } = Layout
const { Title, Text } = Typography

function App() {
  return (
    <Layout className="min-h-screen bg-slate-50">
      <Header className="flex flex-col gap-1 px-6 py-4 bg-slate-900">
        <Title level={3}>Real-Time Football Dashboard</Title>
        <Text className="text-blue-200">Vista inicial del grid solicitado</Text>
      </Header>

      <Content className="p-6">
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          {/* Fila 1: 3 columnas iguales */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card title="Columna 1" bordered={false} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Text>Contenido de ejemplo</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Columna 2" bordered={false} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Text>Contenido de ejemplo</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Columna 3" bordered={false} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Text>Contenido de ejemplo</Text>
              </Card>
            </Col>
          </Row>

          {/* Fila 2: primera columna ocupa 2/3, segunda columna dividida en dos filas */}
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} md={16}>
              <Card title="Columna amplia" bordered={false} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <Text>Esta columna ocupa el doble de ancho.</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Space orientation="vertical" size={16} style={{ display: 'flex', height: '100%' }}>
                <Card title="Subcolumna 1" bordered={false} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow" bodyStyle={{ height: '100%' }}>
                  <Text>Fila superior</Text>
                </Card>
                <Card title="Subcolumna 2" bordered={false} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow" bodyStyle={{ height: '100%' }}>
                  <Text>Fila inferior</Text>
                </Card>
              </Space>
            </Col>
          </Row>
        </Space>
      </Content>
    </Layout>
  )
}

export default App
