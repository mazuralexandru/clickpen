import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  markdownContent: string;
}

export default function MarkdownPreview({ markdownContent }: MarkdownPreviewProps) {
  return (
    <div className="h-full overflow-auto bg-white text-black p-4">
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  );
}