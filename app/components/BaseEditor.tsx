import React, { useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { Extension } from '@codemirror/state';
import { highlightField, addLineHighlight, addWordHighlight, computeDiff } from '../utils/diffHighlighter';

interface BaseEditorProps {
  code: string;
  onChange: (value: string) => void;
  extensions: Extension[];
  title: string;
  rightElement?: React.ReactNode;
}

const BaseEditor: React.FC<BaseEditorProps> = ({
  code,
  onChange,
  extensions,
  title,
  rightElement
}) => {
  const prevCodeRef = useRef(code);
  const editorRef = useRef<any>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (prevCodeRef.current !== code && editorRef.current) {
      const { lines, words } = computeDiff(prevCodeRef.current, code);
      const view = editorRef.current.view;
      
      if (view) {
        // Apply both line and word highlights immediately
        view.dispatch({
          effects: [
            addLineHighlight.of(lines),
            addWordHighlight.of(words)
          ]
        });
      }
      
      prevCodeRef.current = code;
    }
  }, [code]);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="text-sm p-2 font-medium bg-[#21252b] flex justify-between items-center">
        <span>{title}</span>
        {rightElement}
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={[...extensions, highlightField]}
          onChange={onChange}
          className="h-full"
          ref={editorRef}
        />
      </div>
    </div>
  );
};

export default React.memo(BaseEditor);