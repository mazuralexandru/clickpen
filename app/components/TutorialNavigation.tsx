'use client';
import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Chapter {
  name: string;
  path: string;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  path: string;
}

interface TutorialNavigationProps {
  onSelectLesson: (chapterPath: string, lessonPath: string) => void;
  currentChapter?: string;
  currentLesson?: string;
}

export default function TutorialNavigation({
  onSelectLesson,
  currentChapter,
  currentLesson,
}: TutorialNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch chapters data on component mount
  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true);
      try {
        const response = await fetch('/tutorials/css/chapters.json');
        const data = await response.json();
        setChapters(data.chapters);
        
        // If we have current chapter/lesson, preselect them
        if (currentChapter && data.chapters.length > 0) {
          const chapterIndex = data.chapters.findIndex(
            (chapter: Chapter) => chapter.path === currentChapter
          );
          if (chapterIndex >= 0) {
            setSelectedChapterIndex(chapterIndex);
          }
        }
      } catch (error) {
        console.error('Error loading chapters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [currentChapter]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLesson = (lesson: Lesson) => {
    const chapter = chapters[selectedChapterIndex];
    onSelectLesson(chapter.path, lesson.path);
    setIsOpen(false); // Close the dropdown after selection
  };

  const selectChapter = (index: number) => {
    setSelectedChapterIndex(index);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#2c313a] hover:bg-[#353b45]"
      >
        Tutorials <ChevronDownIcon className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 right-0 w-[600px] bg-[#1e1e1e] border border-[#444] rounded shadow-lg">
          {loading ? (
            <div className="p-4 text-center">Loading tutorials...</div>
          ) : (
            <div className="flex h-[400px]">
              {/* Left panel - Chapters */}
              <div className="w-1/3 border-r border-[#444] overflow-y-auto">
                <div className="p-2 bg-[#2c313a] border-b border-[#444] font-medium">Chapters</div>
                <ul>
                  {chapters.map((chapter, index) => (
                    <li 
                      key={index}
                      className={`p-2 cursor-pointer hover:bg-[#2c313a] ${
                        index === selectedChapterIndex ? 'bg-[#3c4049] font-medium' : ''
                      }`}
                      onClick={() => selectChapter(index)}
                    >
                      {`${index + 1}. ${chapter.name} (${chapter.lessons.length} lessons)`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right panel - Lessons */}
              <div className="w-2/3 overflow-y-auto">
                <div className="p-2 bg-[#2c313a] border-b border-[#444] font-medium">
                  {chapters[selectedChapterIndex]?.name ? 
                    `${selectedChapterIndex + 1}. ${chapters[selectedChapterIndex]?.name}` : 'Lessons'}
                </div>
                <ul>
                  {chapters[selectedChapterIndex]?.lessons.map((lesson, index) => (
                    <li
                      key={index}
                      className={`p-2 cursor-pointer hover:bg-[#2c313a] ${
                        currentLesson === lesson.path ? 'bg-[#3c4049] font-medium' : ''
                      }`}
                      onClick={() => selectLesson(lesson)}
                    >
                      {`${index + 1}. ${lesson.title}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}