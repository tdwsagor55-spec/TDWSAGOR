import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { SplashScreen } from './components/common/SplashScreen';
import { AndroidFrame } from './components/common/AndroidFrame';
import { HomeScreen } from './components/home/HomeScreen';
import { PhotoEditor } from './components/photo/PhotoEditor';
import { VideoEditor } from './components/video/VideoEditor';
import { AiGeneratorScreen } from './components/ai/AiGeneratorScreen';
import { TemplatesScreen } from './components/templates/TemplatesScreen';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { ApkBuildGuideModal } from './components/common/ApkBuildGuideModal';
import { ActiveTab } from './types';

function MainApp() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [photoSubTool, setPhotoSubTool] = useState<string | undefined>(undefined);
  const [aiInitialMode, setAiInitialMode] = useState<'photo' | 'video'>('photo');
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(false);
  const [showApkGuide, setShowApkGuide] = useState<boolean>(false);

  // Navigate to specific sub-tool directly from home quick actions
  const openToolWithMode = (tab: ActiveTab, subTool?: string) => {
    if (tab === 'photo') {
      setPhotoSubTool(subTool);
      setActiveTab('photo');
    } else if (tab === 'ai') {
      setAiInitialMode(subTool === 'video' ? 'video' : 'photo');
      setActiveTab('ai');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <AndroidFrame enabled={isAndroidFrame}>
        <div className="flex flex-col min-h-screen bg-[#07070d] text-slate-100">
          {/* Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAndroidFrame={isAndroidFrame}
            setIsAndroidFrame={setIsAndroidFrame}
          />

          {/* Main Workspace Body */}
          <main className="flex-1 overflow-x-hidden">
            {activeTab === 'home' && (
              <HomeScreen
                setActiveTab={setActiveTab}
                openToolWithMode={openToolWithMode}
                onOpenApkGuide={() => setShowApkGuide(true)}
              />
            )}

            {activeTab === 'photo' && (
              <PhotoEditor initialSubTool={photoSubTool} />
            )}

            {activeTab === 'video' && <VideoEditor />}

            {activeTab === 'ai' && (
              <AiGeneratorScreen
                initialMode={aiInitialMode}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesScreen setActiveTab={setActiveTab} />
            )}

            {activeTab === 'dashboard' && (
              <UserDashboard
                setActiveTab={setActiveTab}
                onOpenApkGuide={() => setShowApkGuide(true)}
              />
            )}
          </main>

          {/* Bottom Navigation Dock */}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </AndroidFrame>

      {/* Global Modals */}
      <AuthModal />
      <ApkBuildGuideModal
        isOpen={showApkGuide}
        onClose={() => setShowApkGuide(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProjectProvider>
          <MainApp />
        </ProjectProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
