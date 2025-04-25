import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { ExternalLink, Image } from 'lucide-react';
import CodeBlock from '../CodeBlock';
import 'katex/dist/katex.min.css';

// Utility functions
const containsEmoji = (str: string) => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};

// Process markdown content for custom extensions
const processMarkdown = (content: string) => {
  // Handle details tags
  let processedContent = content.replace(
    /:::(\w+)\s+(.*?)\n([\s\S]*?):::/g,
    (_, type, title, content) => {
      if (type === 'details') {
        return `<details><summary>${title}</summary>\n\n${content}\n\n</details>`;
      }
      if (type === 'warning') {
        return `> **⚠️ Warning:** ${title}\n>\n> ${content.replace(/\n/g, '\n> ')}`;
      }
      if (type === 'info') {
        return `> **ℹ️ Info:** ${title}\n>\n> ${content.replace(/\n/g, '\n> ')}`;
      }
      if (type === 'tip') {
        return `> **💡 Tip:** ${title}\n>\n> ${content.replace(/\n/g, '\n> ')}`;
      }
      return _;
    }
  );
  
  // Handle keyboard shortcuts
  processedContent = processedContent.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, key) => `<kbd>${key}</kbd>`
  );
  
  return processedContent;
};

// Task List Item component
const TaskListItem = ({ checked, children, theme }: { checked: boolean, children: React.ReactNode, theme?: 'dark' | 'light' }) => (
  <li className="flex items-start gap-2 my-1">
    <div className="relative flex items-center justify-center min-w-5 h-5 mt-1">
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className={`w-4 h-4 ${
          theme === 'light' 
            ? 'border-gray-400 focus:ring-blue-500' 
            : 'border-gray-600 focus:ring-blue-400'
        } rounded`}
      />
    </div>
    <div className="flex-1">{children}</div>
  </li>
);

// Details component
const Details = ({ summary, children, open = false, theme = 'dark' }: { summary: React.ReactNode, children: React.ReactNode, open?: boolean, theme?: 'dark' | 'light' }) => {
  const [isOpen, setIsOpen] = React.useState(open);
  
  return (
    <div className={`border rounded-md my-3 ${
      theme === 'light' ? 'border-gray-300' : 'border-gray-700'
    } hover-card`}>
      <div 
        className={`flex items-center gap-2 p-3 cursor-pointer ${
          theme === 'light' 
            ? 'bg-gray-100 hover:bg-gray-200' 
            : 'bg-gray-800 hover:bg-gray-750'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-medium">{summary}</div>
      </div>
      {isOpen && (
        <div className={`p-3 border-t ${
          theme === 'light' ? 'border-gray-300' : 'border-gray-700'
        }`}>
          {children}
        </div>
      )}
    </div>
  );
};

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
  theme?: 'dark' | 'light';
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  content, 
  isStreaming = false, 
  theme = 'dark'
}) => {
  // Create markdown components with appropriate theme styling
  const MarkdownComponents = React.useMemo(() => ({
    // Use CodeBlock component for code rendering
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const code = String(children).replace(/\n$/, '');
      const language = match?.[1] || 'text';
      
      return (
        <CodeBlock 
          code={code} 
          language={language} 
          inline={!!inline} 
          theme={theme} 
          {...props} 
        />
      );
    },
    
    // Custom styling for other markdown elements
    h1: ({ node, ...props }: any) => (
      <h1 className={`text-2xl font-bold my-4 pb-1 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`} id={props.id || ''} {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className={`text-xl font-bold my-3 pb-1 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`} id={props.id || ''} {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className={`text-lg font-bold my-2 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`} id={props.id || ''} {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className={`text-base font-bold my-2 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`} id={props.id || ''} {...props} />
    ),
    h5: ({ node, ...props }: any) => (
      <h5 className={`text-sm font-bold my-1 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`} id={props.id || ''} {...props} />
    ),
    h6: ({ node, ...props }: any) => (
      <h6 className={`text-xs font-bold my-1 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`} id={props.id || ''} {...props} />
    ),
    
    a: ({ node, ...props }: any) => (
      <a 
        className={`inline-flex items-center gap-0.5 group fancy-link ${
          theme === 'light' ? 'text-blue-600' : 'text-blue-400'
        }`}
        target="_blank" 
        rel="noopener noreferrer" 
        {...props}
      >
        {props.children}
        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    ),
    
    p: ({ node, ...props }: any) => {
      // Check if paragraph contains only an image
      const isImageOnly = React.Children.count(props.children) === 1 && 
        React.isValidElement(props.children) && 
        props.children.type === 'img';
        
      return isImageOnly ? (
        <div className="my-4 flex justify-center">{props.children}</div>
      ) : (
        <p className={`my-3 leading-relaxed ${
          theme === 'light' ? 'text-gray-800' : ''
        }`} {...props} />
      );
    },
    
    img: ({ node, ...props }: any) => (
      <div className="relative group">
        <img 
          className="max-w-full rounded-md hover-card"
          alt={props.alt || "Image"} 
          loading="lazy"
          {...props} 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
          <Image size={24} className="text-white" />
        </div>
      </div>
    ),

    ul: ({ node, ...props }: any) => {
      // Check if these are task list items
      const hasTaskItems = React.Children.toArray(props.children).some((child: any) => 
        React.isValidElement(child) && 
        child.props.checked !== null && 
        child.props.checked !== undefined
      );
      
      return hasTaskItems ? (
        <ul className="my-2 pl-2" {...props} />
      ) : (
        <ul className="list-disc pl-6 my-3 space-y-1" {...props} />
      );
    },
    
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
    
    li: ({ node, ordered, checked, ...props }: any) => {
      if (checked !== null && checked !== undefined) {
        return <TaskListItem checked={checked} theme={theme}>{props.children}</TaskListItem>;
      }
      
      // Check if list item contains an emoji at the start
      if (props.children && typeof props.children[0] === 'string' && containsEmoji(props.children[0].charAt(0))) {
        return (
          <li className="flex items-baseline my-1 gap-2">
            <span className="text-lg leading-none">{props.children[0].charAt(0)}</span>
            <span>{props.children[0].slice(1)}{props.children.slice(1)}</span>
          </li>
        );
      }
      
      return <li className="my-1" {...props} />;
    },
    
    blockquote: ({ node, ...props }: any) => (
      <blockquote className={`pl-4 py-1 my-3 rounded fancy-blockquote ${
        theme === 'light' 
          ? 'bg-blue-50 bg-opacity-50 border-blue-400' 
          : 'bg-gray-800 bg-opacity-30 border-blue-500'
      }`} {...props} />
    ),
    
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-4 rounded-md hover-card">
        <table className="min-w-full" {...props} />
      </div>
    ),
    
    thead: ({ node, ...props }: any) => (
      <thead className={theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'} {...props} />
    ),
    
    tbody: ({ node, ...props }: any) => (
      <tbody className={`divide-y ${
        theme === 'light' ? 'divide-gray-200' : 'divide-gray-700'
      }`} {...props} />
    ),
    
    tr: ({ node, ...props }: any) => (
      <tr className={`transition-colors ${
        theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-800'
      }`} {...props} />
    ),
    
    th: ({ node, ...props }: any) => (
      <th className={`px-4 py-2 text-left text-sm font-medium uppercase tracking-wider ${
        theme === 'light' ? 'text-gray-600' : 'text-gray-300'
      }`} {...props} />
    ),
    
    td: ({ node, ...props }: any) => <td className="px-4 py-2 text-sm" {...props} />,
    
    hr: ({ node, ...props }: any) => (
      <hr className={`my-6 ${
        theme === 'light' ? 'border-gray-300' : 'border-gray-600'
      }`} {...props} />
    ),
    
    // Extend with custom components
    details: ({ node, ...props }: any) => (
      <Details summary={props.summary} theme={theme}>{props.children}</Details>
    ),
  }), [theme]);

  return (
    <div className={`prose ${theme === 'light' ? 'prose-slate' : 'prose-invert'} max-w-none prose-sm prose-shine`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSlug]}
        components={MarkdownComponents}
      >
        {processMarkdown(content)}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-green-500 ml-0.5 animate-pulse"></span>
      )}
    </div>
  );
};

export default MessageContent;