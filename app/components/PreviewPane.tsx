import { useEffect, useRef } from 'react';

interface PreviewPaneProps {
  htmlStructureRef: React.RefObject<string>;
  htmlCodeRef: React.RefObject<string>;
  cssCodeRef: React.RefObject<string>;
  jsCodeRef: React.RefObject<string>;
}

export default function PreviewPane({ htmlStructureRef, htmlCodeRef, cssCodeRef, jsCodeRef }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previousValues = useRef({
    html: '',  // Initialize with empty strings to force first render
    code: '',
    css: '',
    js: ''
  });

  useEffect(() => {
    const updatePreview = () => {
      if (!iframeRef.current) return;
      
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Check if any values have changed
      const currentValues = {
        html: htmlStructureRef.current || '',
        code: htmlCodeRef.current || '',
        css: cssCodeRef.current || '',
        js: jsCodeRef.current || ''
      };

      const hasChanges = Object.entries(currentValues).some(
        ([key, value]) => value !== previousValues.current[key as keyof typeof currentValues]
      );

      if (!hasChanges) {
        return; // No changes, skip update
      }

      // Update previous values
      previousValues.current = currentValues;
      
      // Set the entire HTML structure
      doc.documentElement.innerHTML = htmlStructureRef.current || '';
      
      // Update HTML content
      const htmlElement = doc.getElementById('HTML');
      if (htmlElement) {
        htmlElement.innerHTML = htmlCodeRef.current || '';
        
        // Re-append the script element which might have been overwritten
        const scriptElement = doc.createElement('script');
        scriptElement.id = 'Javascript';
        htmlElement.appendChild(scriptElement);
      }
      
      // Update CSS content
      const styleElement = doc.getElementById('CSS');
      if (styleElement) {
        styleElement.textContent = cssCodeRef.current || '';
      }
      
      // Update JS content
      const scriptElement = doc.getElementById('Javascript');
      if (scriptElement) {
        scriptElement.textContent = `
          try {
            ${jsCodeRef.current || ''}
          } catch (error) {
            console.error('Preview Error:', error);
          }
        `;
      }
    };

    // Set up a requestAnimationFrame loop that checks for changes
    let rafId: number;
    const checkForUpdates = () => {
      updatePreview();
      rafId = requestAnimationFrame(checkForUpdates);
    };
    
    // Start the update loop
    checkForUpdates(); // Call immediately to trigger first render
    
    // Clean up
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [htmlStructureRef, htmlCodeRef, cssCodeRef, jsCodeRef]);

  return (
    <iframe
      className="h-full w-full"
      ref={iframeRef}
      title="preview"
      sandbox="allow-scripts allow-same-origin allow-modals"
    />
  );
}