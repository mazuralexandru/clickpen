import React from 'react';
import { javascript } from '@codemirror/lang-javascript';
import BaseEditor from './BaseEditor';

interface JsEditorProps {
  code: string;
  onChange: (value: string) => void;
}

const JsEditor: React.FC<JsEditorProps> = ({
  code,
  onChange
}) => {
  return (
    <BaseEditor
      code={code}
      onChange={onChange}
      extensions={[javascript()]}
      title="JavaScript"
    />
  );
};

export default React.memo(JsEditor);