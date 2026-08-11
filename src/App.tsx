import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QuestMap } from './components/QuestMap';
import { Scoreboard } from './components/Scoreboard';
import { DidYouKnowModal } from './components/DidYouKnowModal';
import { QuickRecapModal } from './components/QuickRecapModal';
import { ClassroomMode } from './components/ClassroomMode';
import { CertificateModal } from './components/CertificateModal';
import { GradeSheetModal } from './components/GradeSheetModal';
import { OnboardingModal } from './components/OnboardingModal';

// Minigames
import { PatentGame } from './components/games/PatentGame';
import { TrademarkGame } from './components/games/TrademarkGame';
import { CopyrightGame } from './components/games/CopyrightGame';
import { IndustrialDesignGame } from './components/games/IndustrialDesignGame';
import { CaseDetectiveGame } from './components/games/CaseDetectiveGame';
import { StartupSimulatorGame } from './components/games/StartupSimulatorGame';

import { loadGameState, saveGameState, MIN_SCORE_TO_PASS } from './utils/storage';
import type { UserGameState, LevelProgress } from './utils/storage';
import { soundFx } from './utils/audio';
import { logStudentGlobalProgress } from './services/classroomService';

export function App() {
  const [gameState, setGameState] = useState<UserGameState>(() => loadGameState());
  const [currentScreen, setCurrentScreen] = useState<string>('map'); // 'map' or levelId

  // Modal Visibility States
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showTitbits, setShowTitbits] = useState(false);
  const [showClassroom, setShowClassroom] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showGradeSheetLevelId, setShowGradeSheetLevelId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !gameState.profile.isOnboarded);

  // Sync state to LocalStorage & Real-Time Database whenever gameState changes
  useEffect(() => {
    saveGameState(gameState);
    if (gameState.profile.name) {
      const completedCount = Object.values(gameState.levelProgress).filter((l) => l.completed).length;
      logStudentGlobalProgress(
        gameState.profile.name,
        gameState.profile.avatar,
        gameState.totalScore,
        gameState.badges,
        completedCount
      );
    }
  }, [gameState]);

  const handleSelectLevel = (levelId: string) => {
    setCurrentScreen(levelId);
  };

  const handleBackToMap = () => {
    setCurrentScreen('map');
  };

  // Level Completion Handler
  const handleLevelComplete = (levelId: string, earnedScore: number, earnedStars: number) => {
    setGameState((prevState) => {
      const existingProg = prevState.levelProgress[levelId] || {
        levelId,
        unlocked: true,
        completed: false,
        score: 0,
        maxScore: 300,
        stars: 0
      };

      const isPassed = earnedScore >= MIN_SCORE_TO_PASS;

      const updatedProg: LevelProgress = {
        ...existingProg,
        completed: isPassed || existingProg.completed,
        score: Math.max(existingProg.score, earnedScore),
        stars: Math.max(existingProg.stars, earnedStars)
      };

      const updatedLevelProgress = {
        ...prevState.levelProgress,
        [levelId]: updatedProg
      };

      // Create/Update Grade Sheet
      const updatedGradeSheets = {
        ...(prevState.gradeSheets || {}),
        [levelId]: {
          levelId,
          levelTitle: levelId,
          score: Math.max(existingProg.score, earnedScore),
          maxScore: existingProg.maxScore,
          stars: Math.max(existingProg.stars, earnedStars),
          accuracyPercentage: Math.min(100, Math.round((earnedScore / existingProg.maxScore) * 100)),
          completedAt: new Date().toISOString(),
          gradeCode: `CIPAM-GRD-${Math.floor(10000 + Math.random() * 90000)}`
        }
      };

      // Unlock next level ONLY IF score meets MIN_SCORE_TO_PASS threshold
      if (isPassed) {
        const levelSequence = [
          'patents_basic',
          'trademarks_basic',
          'copyrights_basic',
          'designs_basic',
          'detective_case1',
          'detective_case2',
          'detective_case3',
          'startup_simulator'
        ];

        const currentIndex = levelSequence.indexOf(levelId);
        if (currentIndex >= 0 && currentIndex < levelSequence.length - 1) {
          const nextLevelId = levelSequence[currentIndex + 1];
          if (updatedLevelProgress[nextLevelId]) {
            updatedLevelProgress[nextLevelId] = {
              ...updatedLevelProgress[nextLevelId],
              unlocked: true
            };
          }
        }
      }

      // Check badges earned
      const updatedBadges = [...prevState.badges];
      const badgeMap: Record<string, string> = {
        'patents_basic': 'patent_pioneer',
        'trademarks_basic': 'brand_guardian',
        'copyrights_basic': 'copyright_defender',
        'designs_basic': 'design_maestro',
        'detective_case1': 'ip_detective',
        'detective_case2': 'ip_detective',
        'detective_case3': 'ip_detective',
        'startup_simulator': 'startup_tycoon'
      };

      const badgeForLevel = badgeMap[levelId];
      if (badgeForLevel && isPassed && !updatedBadges.includes(badgeForLevel)) {
        updatedBadges.push(badgeForLevel);
        soundFx.playBadgeUnlock();
      }

      // Check if all levels completed for CIPAM champion badge
      const completedCount = Object.values(updatedLevelProgress).filter((l) => l.completed).length;
      if (completedCount >= 8 && !updatedBadges.includes('cipam_champion')) {
        updatedBadges.push('cipam_champion');
      }

      // Recalculate total score
      const newTotalScore = Object.values(updatedLevelProgress).reduce((acc, curr) => acc + curr.score, 0);
      const completedLevelsList = Array.from(new Set(
        isPassed ? [...prevState.completedLevels, levelId] : prevState.completedLevels
      ));

      return {
        ...prevState,
        totalScore: newTotalScore,
        completedLevels: completedLevelsList,
        levelProgress: updatedLevelProgress,
        gradeSheets: updatedGradeSheets,
        badges: updatedBadges,
        certificateEarned: completedCount >= 8
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        gameState={gameState}
        onOpenScoreboard={() => setShowScoreboard(true)}
        onOpenRecap={() => setShowRecap(true)}
        onOpenTitbits={() => setShowTitbits(true)}
        onOpenClassroom={() => setShowClassroom(true)}
        onOpenCertificate={() => setShowCertificate(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onStateReset={(newState) => setGameState(newState)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {currentScreen === 'map' && (
          <QuestMap gameState={gameState} onSelectLevel={handleSelectLevel} />
        )}

        {currentScreen === 'patents_basic' && (
          <PatentGame
            onComplete={(score, stars) => handleLevelComplete('patents_basic', score, stars)}
            onBack={handleBackToMap}
          />
        )}

        {currentScreen === 'trademarks_basic' && (
          <TrademarkGame
            onComplete={(score, stars) => handleLevelComplete('trademarks_basic', score, stars)}
            onBack={handleBackToMap}
          />
        )}

        {currentScreen === 'copyrights_basic' && (
          <CopyrightGame
            onComplete={(score, stars) => handleLevelComplete('copyrights_basic', score, stars)}
            onBack={handleBackToMap}
          />
        )}

        {currentScreen === 'designs_basic' && (
          <IndustrialDesignGame
            onComplete={(score, stars) => handleLevelComplete('designs_basic', score, stars)}
            onBack={handleBackToMap}
          />
        )}

        {(currentScreen === 'detective_case1' || currentScreen === 'detective_case2' || currentScreen === 'detective_case3') && (
          <CaseDetectiveGame
            levelId={currentScreen}
            onComplete={(score, stars) => handleLevelComplete(currentScreen, score, stars)}
            onBack={handleBackToMap}
          />
        )}

        {currentScreen === 'startup_simulator' && (
          <StartupSimulatorGame
            onComplete={(score, stars) => handleLevelComplete('startup_simulator', score, stars)}
            onBack={handleBackToMap}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      {showOnboarding && (
        <OnboardingModal
          gameState={gameState}
          onComplete={(updated) => {
            setGameState(updated);
            setShowOnboarding(false);
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {showScoreboard && (
        <Scoreboard
          gameState={gameState}
          onClose={() => setShowScoreboard(false)}
          onUpdateState={(updated) => setGameState(updated)}
          onOpenGradeSheet={(levelId) => {
            setShowGradeSheetLevelId(levelId);
          }}
        />
      )}

      {showRecap && (
        <QuickRecapModal onClose={() => setShowRecap(false)} />
      )}

      {showTitbits && (
        <DidYouKnowModal onClose={() => setShowTitbits(false)} />
      )}

      {showClassroom && (
        <ClassroomMode onClose={() => setShowClassroom(false)} />
      )}

      {showCertificate && (
        <CertificateModal
          gameState={gameState}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {showGradeSheetLevelId && (
        <GradeSheetModal
          gameState={gameState}
          levelId={showGradeSheetLevelId}
          onClose={() => setShowGradeSheetLevelId(null)}
        />
      )}
    </div>
  );
}

export default App;

