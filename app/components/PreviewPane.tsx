import { useEffect, useRef } from 'react';

interface PreviewPaneProps {
  htmlRef: React.RefObject<string>;
  cssCodeRef: React.RefObject<string>;
  jsCodeRef: React.RefObject<string>;
}

export default function PreviewPane({ htmlRef, cssCodeRef, jsCodeRef }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previousValues = useRef({
    html: '',
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
        html: htmlRef.current || '',
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
      
      // Set the HTML content
      doc.documentElement.innerHTML = htmlRef.current || '';

      // Ensure CSS element exists in head
      let styleElement = doc.getElementById('CSS');
      if (!styleElement) {
        styleElement = doc.createElement('style');
        styleElement.id = 'CSS';
        const head = doc.head || doc.getElementsByTagName('head')[0];
        if (head) {
          head.appendChild(styleElement);
        }
      }
      styleElement.textContent = cssCodeRef.current || '';

      // Ensure JavaScript element exists at end of body
      let scriptElement = doc.getElementById('Javascript');
      if (scriptElement) {
        // Remove existing script element if it exists
        scriptElement.remove();
      }
      // Create new script element and append to end of body
      scriptElement = doc.createElement('script');
      scriptElement.id = 'Javascript';
      scriptElement.textContent = `
        try {
          ${jsCodeRef.current || ''}
        } catch (error) {
          console.error('Preview Error:', error);
        }
      `;
      const body = doc.body || doc.getElementsByTagName('body')[0];
      if (body) {
        body.appendChild(scriptElement);
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
  }, [htmlRef, cssCodeRef, jsCodeRef]);

  return (
    <iframe
      className="w-full h-full"
      ref={iframeRef}
      title="preview"
      sandbox="allow-scripts allow-same-origin allow-modals"
    />
  );
}