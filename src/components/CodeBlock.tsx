import React, { useState, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  showHeader?: boolean;
  allowCopy?: boolean;
  allowDownload?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  showLineNumbers = true,
  showHeader = true,
  allowCopy = true,
  allowDownload = true
}) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `code.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Use the tomorrow theme which has good highlighting but modify the background
  const syntaxStyle = {
    ...tomorrow,
    'pre[class*="language-"]': {
      ...tomorrow['pre[class*="language-"]'],
      background: '#1e1e1e',
      margin: 0,
    },
    'code[class*="language-"]': {
      ...tomorrow['code[class*="language-"]'],
      background: '#1e1e1e',
    }
  };

  return (
    <div className="rounded-md overflow-hidden bg-gray-900 text-gray-200" ref={codeRef}>
      {showHeader && (
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="text-sm font-mono text-gray-400">
            {language}
          </div>
          <div className="flex gap-2">
            {allowCopy && (
              <button
                onClick={copyToClipboard}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                aria-label="Copy code"
              >
                {copied ? "Copied" : (
                  <>
                    <Copy size={16} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
            {allowDownload && (
              <button
                onClick={downloadCode}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                aria-label="Download code"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
        <SyntaxHighlighter
          language={language}
          style={syntaxStyle}
          showLineNumbers={showLineNumbers && code.split('\n').length > 1}
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: '#6c7086',
            textAlign: 'right',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit',
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;