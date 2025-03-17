import React from 'react';
import { html } from '@codemirror/lang-html';
import BaseEditor from './BaseEditor';

interface HtmlEditorProps {
  code: string;
  onChange: (value: string) => void;
  showFullHtml: boolean;
  onToggleFullHtml: () => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({
  code,
  onChange,
  showFullHtml,
  onToggleFullHtml
}) => {
  const toggleButton = (
    <button 
      onClick={onToggleFullHtml}
      className="text-xs px-2 py-1 rounded bg-[#2c313a] hover:bg-[#353b45]"
    >
      {showFullHtml ? 'See less HTML' : 'See full HTML'}
    </button>
  );

  return (
    <BaseEditor
      code={code}
      onChange={onChange}
      extensions={[html()]}
      title="HTML"
      rightElement={toggleButton}
    />
  );
};

export default React.memo(HtmlEditor);