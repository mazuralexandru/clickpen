import React from 'react';
import { html } from '@codemirror/lang-html';
import BaseEditor from './BaseEditor';

interface HtmlEditorProps {
  code: string;
  onChange: (value: string) => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({
  code,
  onChange
}) => {
  return (
    <BaseEditor
      code={code}
      onChange={onChange}
      extensions={[html()]}
      title="HTML"
    />
  );
};

export default React.memo(HtmlEditor);