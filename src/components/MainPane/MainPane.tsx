// MainPane.tsx
import React, { useState, useEffect } from 'react';
import FusionArea from './components/FusionArea';
import MintPage from './components/MintPage';
import styled from 'styled-components';
import normalModeElements from './element_recipes_with_rarity.json';
import web3ModeElements from './element_recipes_with_rarity2.json';
import { useSignMessageHook } from '../../hooks/useSignMessageHook';
import { Spinner, useToast } from '@chakra-ui/react';
import ResizableDivider from './components/ResizableDivider';

import BackgroundPattern from './BackgroundPattern';
type Element = {
  id: number;
  name: string;
  imagePath: string;
  rarity: string;
};

type Combination = {
  input: string[];
  output: string;
  rarity: string;
};

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
    @media (max-width: 768px) {
    flex-direction: column;
  }
`;




const Pane = styled.div`
  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
`;
const LeftPane = styled(Pane)<{ width: string }>`
  width: ${props => props.width};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  @media (max-width: 768px) {
    width: 100%;
    height: 50%;
    border-bottom: 2px solid #ccc;
  }
`;

const RightPane = styled(Pane)<{ width: string }>`
  width: ${props => props.width};
  padding: 20px;
  overflow-y: auto;
  @media (max-width: 768px) {
    width: 100%;
    height: 50%;
  }
`;

const MainPane = () => {
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);
  const [discoveredElements, setDiscoveredElements] = useState<Element[]>([]);
  const [result, setResult] = useState<{ success: boolean; element: Element | null } | null>(null);
  const { saveElements, loadElements } = useSignMessageHook();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [backgroundPatternEnabled, setBackgroundPatternEnabled] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState('75%');
  const [rightPaneWidth, setRightPaneWidth] = useState('25%');

  const [currentMode, setCurrentMode] = useState<'normal' | 'web3'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return (urlParams.get('mode') as 'normal' | 'web3') || 'normal';
  });
  const [normalModeDiscoveredElements, setNormalModeDiscoveredElements] = useState<Element[]>([]);
  const [web3ModeDiscoveredElements, setWeb3ModeDiscoveredElements] = useState<Element[]>([]);
  const addDiscoveredElement = (newElement: Element) => {
    if (currentMode === 'normal') {
      setNormalModeDiscoveredElements(prev => [...prev, newElement]);
    } else {
      setWeb3ModeDiscoveredElements(prev => [...prev, newElement]);
    }
  };
  const handleResize = (newLeftWidth: number) => {
    const containerWidth = document.getElementById('main-container')?.clientWidth || 0;
    const newLeftPercentage = (newLeftWidth / containerWidth) * 100;
    const newRightPercentage = 100 - newLeftPercentage;

    if (newLeftPercentage >= 20 && newLeftPercentage <= 80) {
      setLeftPaneWidth(`${newLeftPercentage}%`);
      setRightPaneWidth(`${newRightPercentage}%`);
    }
  };

  useEffect(() => {
    const loadSavedElements = async () => {
      const savedElements = await loadElements();
      if (currentMode === 'normal') {
        setNormalModeDiscoveredElements(savedElements);
      } else {
        setWeb3ModeDiscoveredElements(savedElements);
      }
    };
    loadSavedElements();
  }, [currentMode]);
  

  const handleElementClick = (element: Element) => {
    if (selectedElements.length < 2) {
      setSelectedElements([...selectedElements, element]);
    }
  };

  const handleElementRemove = (index: number) => {
    const newElements = [...selectedElements];
    newElements.splice(index, 1);
    setSelectedElements(newElements);
    setResult(null);
  };
  const updateDiscoveredElements = (newElement: Element) => {
    if (currentMode === 'normal') {
      if (!normalModeDiscoveredElements.some(el => el.name === newElement.name)) {
        setNormalModeDiscoveredElements([...normalModeDiscoveredElements, newElement]);
      }
    } else {
      if (!web3ModeDiscoveredElements.some(el => el.name === newElement.name)) {
        setWeb3ModeDiscoveredElements([...web3ModeDiscoveredElements, newElement]);
      }
    }
  };
  const checkCombination = () => {
    if (selectedElements.length === 2) {
      const inputs = selectedElements.map((el) => el.name.toLowerCase());
      const recipeData = currentMode === 'normal' ? normalModeElements : web3ModeElements;
      const combination = recipeData.find((combo: Combination) => {
        return (
          (combo.input[0] === inputs[0] && combo.input[1] === inputs[1]) ||
          (combo.input[0] === inputs[1] && combo.input[1] === inputs[0])
        );
      });
      if (combination) {
        const newElement = {
          id: Date.now(),
          name: combination.output,
          imagePath: currentMode === 'normal' ? `/images/${combination.output}.png` : `/images2/${combination.output}.png`,
          rarity: combination.rarity,
        };
        updateDiscoveredElements(newElement);
        setResult({ success: true, element: newElement });
      } else {
        setResult({ success: false, element: null });
      }
    }
  };


  const handleSave = async () => {
    setIsLoading(true);
    const elementsToSave = currentMode === 'normal' ? normalModeDiscoveredElements : web3ModeDiscoveredElements;
    await saveElements(elementsToSave);
    setIsLoading(false);
    toast({
      title: "Elements saved",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleScrollToTop = () => {
    document.querySelector('.right-pane')?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    checkCombination();
  }, [selectedElements]);


  return (
    <Container id="main-container">
      {backgroundPatternEnabled && <BackgroundPattern />}
      <LeftPane width={leftPaneWidth}>
      <FusionArea
        selectedElements={selectedElements}
        onElementRemove={handleElementRemove}
        result={result as { success: boolean; element: Element } | null}
        onSave={handleSave}
        onElementClick={handleElementClick}
        backgroundPatternEnabled={backgroundPatternEnabled}
        setBackgroundPatternEnabled={setBackgroundPatternEnabled}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        discoveredElements={currentMode === 'normal' ? normalModeDiscoveredElements : web3ModeDiscoveredElements}
      />
        {isLoading && <Spinner />}
      </LeftPane>
      <ResizableDivider onResize={handleResize} />
      <RightPane width={rightPaneWidth} className="right-pane">
      <MintPage
  onElementClick={handleElementClick}
  normalModeDiscoveredElements={normalModeDiscoveredElements}
  web3ModeDiscoveredElements={web3ModeDiscoveredElements}
  currentMode={currentMode}
/>


        {/* <ScrollToTopButton onClick={handleScrollToTop}>
          <ArrowUpIcon />
        </ScrollToTopButton> */}
      </RightPane>
    </Container>
  );
};

export default MainPane;
