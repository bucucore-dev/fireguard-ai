"use client";

import React from "react";

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

/**
 * Format AI message content with better styling
 * Supports:
 * - Bold text (**text**)
 * - Lists (- item)
 * - Tables (| col | col |)
 * - Code blocks (```code```)
 * - Line breaks
 */
export function MessageContent({ content, isUser }: MessageContentProps) {
  if (isUser) {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }

  // Format AI response
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let inCodeBlock = false;
    let codeLines: string[] = [];

    lines.forEach((line, index) => {
      // Code block
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${index}`} className="bg-black/10 dark:bg-white/10 rounded p-2 my-2 overflow-x-auto">
              <code className="text-xs">{codeLines.join('\n')}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Table detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true;
          elements.push(<div key={`table-start-${index}`} className="my-2 overflow-x-auto" />);
        }
        
        const cells = line.split('|').filter(cell => cell.trim());
        const isHeader = cells.some(cell => cell.includes('---'));
        
        if (isHeader) {
          // Skip separator line
          return;
        }

        elements.push(
          <div key={`table-row-${index}`} className="flex gap-2 py-1 border-b border-border/50 last:border-0">
            {cells.map((cell, i) => (
              <div key={i} className="flex-1 text-xs font-medium">
                {formatInlineText(cell.trim())}
              </div>
            ))}
          </div>
        );
        return;
      } else {
        if (inTable) {
          inTable = false;
        }
      }

      // List items
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const text = line.trim().substring(2);
        elements.push(
          <div key={`list-${index}`} className="flex gap-2 my-1">
            <span className="text-orange-600 dark:text-orange-400 flex-shrink-0">•</span>
            <span className="text-sm flex-1">{formatInlineText(text)}</span>
          </div>
        );
        return;
      }

      // Numbered lists
      const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        const [, num, text] = numberedMatch;
        elements.push(
          <div key={`numbered-${index}`} className="flex gap-2 my-1">
            <span className="text-orange-600 dark:text-orange-400 flex-shrink-0 font-medium">{num}.</span>
            <span className="text-sm flex-1">{formatInlineText(text)}</span>
          </div>
        );
        return;
      }

      // Headers
      if (line.trim().startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${index}`} className="font-semibold text-sm mt-3 mb-1">
            {line.trim().substring(4)}
          </h4>
        );
        return;
      }

      if (line.trim().startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${index}`} className="font-bold text-base mt-3 mb-2">
            {line.trim().substring(3)}
          </h3>
        );
        return;
      }

      // Empty line
      if (line.trim() === '') {
        elements.push(<div key={`space-${index}`} className="h-2" />);
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${index}`} className="text-sm my-1">
          {formatInlineText(line)}
        </p>
      );
    });

    return elements;
  };

  // Format inline text (bold, italic, code)
  const formatInlineText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.substring(0, boldMatch.index));
        }
        parts.push(
          <strong key={`bold-${key++}`} className="font-semibold text-orange-600 dark:text-orange-400">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Inline code `code`
      const codeMatch = remaining.match(/`(.+?)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          parts.push(remaining.substring(0, codeMatch.index));
        }
        parts.push(
          <code key={`code-${key++}`} className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
        continue;
      }

      // Emoji or special characters
      parts.push(remaining);
      break;
    }

    return parts;
  };

  return <div className="space-y-1">{formatContent(content)}</div>;
}
