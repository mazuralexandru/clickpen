import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { diffWords, diffLines } from 'diff';

// Effects for both line and word highlights
export const addLineHighlight = StateEffect.define<{from: number; to: number}[]>();
export const addWordHighlight = StateEffect.define<{from: number; to: number}[]>();

// Create decorations for lines and words
const changedLineDecoration = Decoration.line({
  class: "cm-changed-line"
});

const changedWordDecoration = Decoration.mark({
  class: "cm-changed-word"
});

// StateField to manage the decorations
export const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    
    for (let e of tr.effects) {
      if (e.is(addLineHighlight)) {
        highlights = Decoration.none;
        for (let range of e.value) {
          highlights = highlights.update({
            add: [changedLineDecoration.range(range.from)]
          });
        }
      } else if (e.is(addWordHighlight)) {
        // Add word highlights without clearing existing line highlights
        for (let range of e.value) {
          highlights = highlights.update({
            add: [changedWordDecoration.range(range.from, range.to)]
          });
        }
      }
    }
    
    return highlights;
  },
  provide: f => EditorView.decorations.from(f)
});

interface DiffChange {
  from: number;
  to: number;
  text?: string;
}

export function computeDiff(oldText: string, newText: string): { lines: DiffChange[], words: DiffChange[] } {
  const lines: DiffChange[] = [];
  const words: DiffChange[] = [];
  
  // First compute line differences
  const lineDiff = diffLines(oldText, newText);
  let linePos = 0;
  
  lineDiff.forEach(part => {
    if (part.added || part.removed) {
      lines.push({
        from: linePos,
        to: linePos + part.value.length,
        text: part.value
      });
    }
    if (!part.removed) {
      linePos += part.value.length;
    }
  });
  
  // Then compute word differences within changed lines
  const wordDiff = diffWords(oldText, newText);
  let wordPos = 0;
  
  wordDiff.forEach(part => {
    if (part.added) {
      words.push({
        from: wordPos,
        to: wordPos + part.value.length,
        text: part.value
      });
    }
    if (!part.removed) {
      wordPos += part.value.length;
    }
  });
  
  return { lines, words };
}