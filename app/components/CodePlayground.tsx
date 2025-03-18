'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import Split from 'react-split';
import PreviewPane from './PreviewPane';
import HtmlEditor from './HtmlEditor';
import CssEditor from './CssEditor';
import JsEditor from './JsEditor';
import tutorialData from './tutorial.json';
import MarkdownPreview from './MarkdownPreview';

interface CodePlaygroundProps {
  initialHtmlStructure: string;
  initialHtmlCode: string;
  initialCssCode: string;
  initialJsCode: string;
  initialMarkdownContent?: string;
}

export default function CodePlayground({
  initialHtmlStructure,
  initialHtmlCode,
  initialCssCode,
  initialJsCode,
  initialMarkdownContent = '# Welcome to the Tutorial\nClick "Start Tutorial" to begin learning!'
}: CodePlaygroundProps) {
  // Refs for immediate preview updates
  const htmlStructureRef = useRef(initialHtmlStructure);
  const htmlCodeRef = useRef(initialHtmlCode);
  const cssCodeRef = useRef(initialCssCode);
  const jsCodeRef = useRef(initialJsCode);

  // State for editor display (debounced updates)
  const [htmlStructure, setHtmlStructure] = useState(initialHtmlStructure);
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode);
  const [cssCode, setCssCode] = useState(initialCssCode);
  const [jsCode, setJsCode] = useState(initialJsCode);
  const [showFullHtml, setShowFullHtml] = useState(false);
  const [currentExample, setCurrentExample] = useState<number | null>(null);
  const [markdownContent, setMarkdownContent] = useState(initialMarkdownContent);
  const [showEditors, setShowEditors] = useState(true);

  // Access tutorial data
  const { title, introduction, examples } = tutorialData;

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced state setters
  const debouncedSetHtmlStructure = useCallback(debounce(setHtmlStructure, 500), []);
  const debouncedSetHtmlCode = useCallback(debounce(setHtmlCode, 500), []);
  const debouncedSetCssCode = useCallback(debounce(setCssCode, 500), []);
  const debouncedSetJsCode = useCallback(debounce(setJsCode, 500), []);

  // Change handlers
  const handleHtmlChange = useCallback((value: string) => {
    if (showFullHtml) {
      htmlStructureRef.current = value;
      debouncedSetHtmlStructure(value);
    } else {
      htmlCodeRef.current = value;
      debouncedSetHtmlCode(value);
    }
  }, [showFullHtml]);

  const handleCssChange = useCallback((value: string) => {
    cssCodeRef.current = value;
    debouncedSetCssCode(value);
  }, []);

  const handleJsChange = useCallback((value: string) => {
    jsCodeRef.current = value;
    debouncedSetJsCode(value);
  }, []);

  const toggleFullHtml = useCallback(() => {
    setShowFullHtml(prev => !prev);
  }, []);

  // Load content from clipboard
  const loadFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = JSON.parse(clipboardText);
      
      if (parsedData.HTML !== undefined && 
          parsedData.CSS !== undefined && 
          parsedData.JS !== undefined) {
        // Update both refs and state
        htmlCodeRef.current = parsedData.HTML;
        cssCodeRef.current = parsedData.CSS;
        jsCodeRef.current = parsedData.JS;
        
        setHtmlCode(parsedData.HTML);
        setCssCode(parsedData.CSS);
        setJsCode(parsedData.JS);
      } else {
        alert('Invalid JSON format. Expected {"HTML": "...", "CSS": "...", "JS": "..."}');
      }
    } catch (error) {
      alert('Failed to load from clipboard. Make sure you have valid JSON copied.');
      console.error(error);
    }
  };

  // Start tutorial function
  const startTutorial = () => {
    setCurrentExample(0);
    setMarkdownContent(introduction);
    
    // Clear code editors for introduction but keep them visible
    htmlCodeRef.current = '';
    cssCodeRef.current = '';
    jsCodeRef.current = '';
    
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
  };

  // Navigation functions
  const goToPreviousExample = () => {
    if (currentExample === null) return;
    
    if (currentExample === 0) {
      // Already at introduction, can't go back
      return;
    }
    
    const prevIndex = currentExample - 1;
    setCurrentExample(prevIndex);
    
    if (prevIndex === 0) {
      // Going back to introduction
      setMarkdownContent(introduction || '');
      
      // Clear code editors but keep them visible
      htmlCodeRef.current = '';
      cssCodeRef.current = '';
      jsCodeRef.current = '';
      
      setHtmlCode('');
      setCssCode('');
      setJsCode('');
    } else {
      // Going to previous example
      const example = examples[prevIndex - 1];
      
      htmlCodeRef.current = example.html || '';
      cssCodeRef.current = example.css || '';
      jsCodeRef.current = example.javascript || '';
      
      setHtmlCode(example.html || '');
      setCssCode(example.css || '');
      setJsCode(example.javascript || '');
      setMarkdownContent(`# ${example.title}\n\n${example.explanation || ''}`);
    }
  };

  const goToNextExample = () => {
    if (currentExample === null) return;
    
    const nextIndex = currentExample + 1;
    
    if (currentExample === 0) {
      // Moving from introduction to first example
      const example = examples[0];
      setShowEditors(true);
      
      htmlCodeRef.current = example.html || '';
      cssCodeRef.current = example.css || '';
      jsCodeRef.current = example.javascript || '';
      
      setHtmlCode(example.html || '');
      setCssCode(example.css || '');
      setJsCode(example.javascript || '');
      setMarkdownContent(`# ${example.title}\n\n${example.explanation || ''}`);
    } else if (nextIndex <= examples.length) {
      // Moving to next example
      const example = examples[nextIndex - 1];
      
      htmlCodeRef.current = example.html || '';
      cssCodeRef.current = example.css || '';
      jsCodeRef.current = example.javascript || '';
      
      setHtmlCode(example.html || '');
      setCssCode(example.css || '');
      setJsCode(example.javascript || '');
      setMarkdownContent(`# ${example.title}\n\n${example.explanation || ''}`);
    }
    
    setCurrentExample(nextIndex);
  };

  // Add keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentExample === null) return;
      
      if (event.altKey) {
        if (event.key === 'a') {
          goToPreviousExample();
        } else if (event.key === 's') {
          goToNextExample();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentExample, goToPreviousExample, goToNextExample]);

  return (
    <div className="h-screen w-full overflow-hidden">
      <Split
        className="h-full split"
        sizes={[50, 50]}
        minSize={200}
        gutterSize={8}
        snapOffset={30}
        dragInterval={1}
      >
        <div className="h-full overflow-hidden">
          <Split
            className="h-full"
            direction="vertical"
            sizes={[33.33, 33.33, 33.33]}
            minSize={100}
            gutterSize={8}
            snapOffset={30}
            dragInterval={1}
          >
            <HtmlEditor 
              code={showFullHtml ? htmlStructure : htmlCode}
              onChange={handleHtmlChange}
              showFullHtml={showFullHtml}
              onToggleFullHtml={toggleFullHtml}
            />
            <CssEditor 
              code={cssCode}
              onChange={handleCssChange}
            />
            <JsEditor 
              code={jsCode}
              onChange={handleJsChange}
            />
          </Split>
        </div>
        <div className="h-full overflow-hidden">
          <Split
            className="h-full"
            direction="vertical"
            sizes={[40, 60]}
            minSize={100}
            gutterSize={8}
            snapOffset={30}
            dragInterval={1}
          >
            <div className="h-full overflow-hidden">
              <div className="text-sm p-2 font-medium bg-[#21252b]">
                <span>Markdown Preview</span>
              </div>
              <MarkdownPreview markdownContent={markdownContent} />
            </div>
            <div className="h-full overflow-hidden">
              <div className="text-sm p-2 font-medium bg-[#21252b] flex justify-between items-center">
                <span>Preview</span>
                <div className="flex items-center gap-2">
                  {currentExample !== null && (
                    <>
                      <button 
                        onClick={goToPreviousExample}
                        disabled={currentExample === 0}
                        className="text-xs px-2 py-1 rounded bg-[#2c313a] hover:bg-[#353b45] disabled:opacity-50"
                      >
                        ←
                      </button>
                      <span className="text-xs">
                        {currentExample === 0 ? 'Introduction' : `Example ${currentExample} of ${examples.length}`}
                      </span>
                      <button 
                        onClick={goToNextExample}
                        disabled={currentExample >= examples.length}
                        className="text-xs px-2 py-1 rounded bg-[#2c313a] hover:bg-[#353b45] disabled:opacity-50"
                      >
                        →
                      </button>
                    </>
                  )}
                  {currentExample === null && (
                    <button 
                      onClick={startTutorial}
                      className="text-xs px-2 py-1 rounded bg-[#2c313a] hover:bg-[#353b45]"
                    >
                      Start Tutorial
                    </button>
                  )}
                </div>
              </div>
              <PreviewPane 
                htmlStructureRef={htmlStructureRef}
                htmlCodeRef={htmlCodeRef}
                cssCodeRef={cssCodeRef}
                jsCodeRef={jsCodeRef}
              />
            </div>
          </Split>
        </div>
      </Split>
    </div>
  );
}