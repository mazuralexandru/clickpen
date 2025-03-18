'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import Split from 'react-split';
import PreviewPane from './PreviewPane';
import HtmlEditor from './HtmlEditor';
import CssEditor from './CssEditor';
import JsEditor from './JsEditor';
import MarkdownPreview from './MarkdownPreview';
import TutorialNavigation from './TutorialNavigation';

interface CodePlaygroundProps {
  initialHtml: string;
  initialCssCode: string;
  initialJsCode: string;
  initialMarkdownContent?: string;
}

interface TutorialData {
  examples: Array<{
    title: string;
    html: string;
    css: string;
    javascript: string;
    explanation: string;
  }>;
  title?: string;
  introduction?: string;
}

interface Chapter {
  name: string;
  path: string;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  path: string;
}

export default function CodePlayground({
  initialHtml,
  initialCssCode,
  initialJsCode,
  initialMarkdownContent = '# Welcome to the Tutorial\nSelect a tutorial from the dropdown to begin learning!'
}: CodePlaygroundProps) {
  // Refs for immediate preview updates
  const htmlRef = useRef(initialHtml);
  const cssCodeRef = useRef(initialCssCode);
  const jsCodeRef = useRef(initialJsCode);
  
  // State for editor display (debounced updates)
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [cssCode, setCssCode] = useState(initialCssCode);
  const [jsCode, setJsCode] = useState(initialJsCode);
  const [currentExample, setCurrentExample] = useState<number | null>(null);
  const [markdownContent, setMarkdownContent] = useState(initialMarkdownContent);
  
  // New state for tutorial navigation
  const [tutorialData, setTutorialData] = useState<TutorialData | null>(null);
  const [currentChapter, setCurrentChapter] = useState<string | undefined>();
  const [currentLesson, setCurrentLesson] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced state setters
  const debouncedSetHtmlCode = useCallback(debounce(setHtmlCode, 500), []);
  const debouncedSetCssCode = useCallback(debounce(setCssCode, 500), []);
  const debouncedSetJsCode = useCallback(debounce(setJsCode, 500), []);

  // Change handlers
  const handleHtmlChange = useCallback((value: string) => {
    htmlRef.current = value;
    debouncedSetHtmlCode(value);
  }, []);
  
  const handleCssChange = useCallback((value: string) => {
    cssCodeRef.current = value;
    debouncedSetCssCode(value);
  }, []);
  
  const handleJsChange = useCallback((value: string) => {
    jsCodeRef.current = value;
    debouncedSetJsCode(value);
  }, []);

  // Fetch chapters data
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch('/tutorials/css/chapters.json');
        const data = await response.json();
        setChapters(data.chapters);
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };
    fetchChapters();
  }, []);

  // Load the next lesson when reaching the end of the current lesson
  const loadNextLesson = useCallback(() => {
    if (!currentChapter || !currentLesson || chapters.length === 0) return false;
    
    const currentChapterIndex = chapters.findIndex(chapter => chapter.path === currentChapter);
    if (currentChapterIndex === -1) return false;
    
    const currentChapterData = chapters[currentChapterIndex];
    const currentLessonIndex = currentChapterData.lessons.findIndex(lesson => lesson.path === currentLesson);
    if (currentLessonIndex === -1) return false;
    
    // If there's another lesson in the current chapter
    if (currentLessonIndex < currentChapterData.lessons.length - 1) {
      const nextLesson = currentChapterData.lessons[currentLessonIndex + 1];
      loadTutorial(currentChapterData.path, nextLesson.path);
      return true;
    } 
    // If there's another chapter
    else if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      if (nextChapter.lessons.length > 0) {
        const nextLesson = nextChapter.lessons[0];
        loadTutorial(nextChapter.path, nextLesson.path);
        return true;
      }
    }
    
    return false;
  }, [currentChapter, currentLesson, chapters]);

  // Load tutorial data from a specific lesson
  const loadTutorial = useCallback(async (chapterPath: string, lessonPath: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/tutorials/${chapterPath}${lessonPath}`);
      const data: TutorialData = await response.json();
      setTutorialData(data);
      setCurrentChapter(chapterPath);
      setCurrentLesson(lessonPath);
      
      // Skip intro and start with the first example directly
      if (data.examples && data.examples.length > 0) {
        setCurrentExample(1);
        
        const example = data.examples[0];
        htmlRef.current = example.html || '';
        cssCodeRef.current = example.css || '';
        jsCodeRef.current = example.javascript || '';
        
        setHtmlCode(example.html || '');
        setCssCode(example.css || '');
        setJsCode(example.javascript || '');
        setMarkdownContent(`# ${example.title}\n\n${example.explanation || ''}`);
      }
    } catch (error) {
      console.error('Error loading tutorial:', error);
      setMarkdownContent('# Error\nFailed to load the selected tutorial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Navigation functions
  const goToPreviousExample = useCallback(() => {
    if (currentExample === null || !tutorialData) return;
    
    if (currentExample <= 1) {
      // Already at first example, can't go back further
      return;
    }
    
    const prevIndex = currentExample - 1;
    setCurrentExample(prevIndex);
    
    // Load the previous example
    const example = tutorialData.examples[prevIndex - 1];
    
    htmlRef.current = example.html || '';
    cssCodeRef.current = example.css || '';
    jsCodeRef.current = example.javascript || '';
    
    setHtmlCode(example.html || '');
    setCssCode(example.css || '');
    setJsCode(example.javascript || '');
    setMarkdownContent(`# ${example.title}\n\n${example.explanation || ''}`);
  }, [currentExample, tutorialData]);

  const goToNextExample = useCallback(() => {
    if (currentExample === null || !tutorialData) return;
    
    if (currentExample < tutorialData.examples.length) {
      // Move to the next example in the current lesson
      const nextIndex = currentExample + 1;
      setCurrentExample(nextIndex);
      
      const example = tutorialData.examples[nextIndex - 1];
      
      htmlRef.current = example.html || '';
      cssCodeRef.current = example.css || '';
      jsCodeRef.current = example.javascript || '';
      
      setHtmlCode(example.html || '');
      setCssCode(example.css || '');
      setJsCode(example.javascript || '');
      setMarkdownContent(`# ${example.title}\n\n${example.explanation || ''}`);
    } else {
      // We're at the end of this lesson, try to load the next lesson
      loadNextLesson();
    }
  }, [currentExample, tutorialData, loadNextLesson]);

  // Handle tutorial selection
  const handleSelectLesson = (chapterPath: string, lessonPath: string) => {
    loadTutorial(chapterPath, lessonPath);
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
              code={htmlCode}
              onChange={handleHtmlChange}
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
              <div className="text-sm p-2 font-medium bg-[#21252b] flex justify-between items-center">
                <span>Markdown Preview</span>
                <TutorialNavigation 
                  onSelectLesson={handleSelectLesson}
                  currentChapter={currentChapter}
                  currentLesson={currentLesson}
                />
              </div>
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-white text-black">
                  <p>Loading tutorial...</p>
                </div>
              ) : (
                <MarkdownPreview markdownContent={markdownContent} />
              )}
            </div>
            <div className="h-full overflow-hidden">
              <div className="text-sm p-2 font-medium bg-[#21252b] flex justify-between items-center">
                <span>Preview</span>
                <div className="flex items-center gap-2">
                  {tutorialData && currentExample !== null && (
                    <>
                      <button 
                        onClick={goToPreviousExample}
                        disabled={currentExample <= 1}
                        className="text-xs px-2 py-1 rounded bg-[#2c313a] hover:bg-[#353b45] disabled:opacity-50"
                      >
                        ←
                      </button>
                      <span className="text-xs">
                        {`Example ${currentExample} of ${tutorialData.examples.length}`}
                      </span>
                      <button 
                        onClick={goToNextExample}
                        disabled={false} // Never disable, it will go to next lesson
                        className="text-xs px-2 py-1 rounded bg-[#2c313a] hover:bg-[#353b45]"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 h-[calc(100%-40px)] overflow-hidden">
                <PreviewPane 
                  htmlRef={htmlRef}
                  cssCodeRef={cssCodeRef}
                  jsCodeRef={jsCodeRef}
                />
              </div>
            </div>
          </Split>
        </div>
      </Split>
    </div>
  );
}