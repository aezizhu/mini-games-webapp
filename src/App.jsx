import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import theme from './styles/theme';
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AppContainer, MainContent, Content } from './styles/Layout';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import Home from './pages/Home';

// Import game components
import Game2048 from './games/Game2048';
import Tetris from './games/Tetris/Tetris.jsx';
import Snake from './games/Snake/Snake.jsx';
import SlotMachine from './games/SlotMachine/SlotMachine.jsx';
import Points24 from './games/Points24/Points24.jsx';
const Doudizhu = () => <div>Doudizhu Game (Coming Soon)</div>;
const Help = () => <div>Help & Instructions (Coming Soon)</div>;

// Main App component
function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AudioProvider>
          <SettingsProvider>
            <GlobalStyle />
            <AppContainer>
              <Header />
              <MainContent>
                <Sidebar />
                <Content>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/2048" element={<Game2048 />} />
                    <Route path="/tetris" element={<Tetris />} />
                    <Route path="/snake" element={<Snake />} />
                    <Route path="/slot-machine" element={<SlotMachine />} />
                    <Route path="/24-points" element={<Points24 />} />
                    <Route path="/doudizhu" element={<Doudizhu />} />
                    <Route path="/help" element={<Help />} />
                  </Routes>
                </Content>
              </MainContent>
              <Footer />
              <SettingsModal />
            </AppContainer>
          </SettingsProvider>
        </AudioProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;