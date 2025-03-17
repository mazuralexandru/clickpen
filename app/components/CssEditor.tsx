import React from 'react';
import { css } from '@codemirror/lang-css';
import BaseEditor from './BaseEditor';

interface CssEditorProps {
  code: string;
  onChange: (value: string) => void;
}

const CssEditor: React.FC<CssEditorProps> = ({
  code,
  onChange
}) => {
  return (
    <BaseEditor
      code={code}
      onChange={onChange}
      extensions={[css()]}
      title="CSS"
    />
  );
};

export default React.memo(CssEditor);